import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  useTexture,
  Sky,
  Stars
} from "@react-three/drei";
import { useSnakeGame } from "@/lib/stores/useSnakeGame";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";
import * as THREE from "three";
import GameControls from "./GameControls";
import GameOverScreen from "./GameOverScreen";

// Snake head and body components
function SnakeHead({ position, direction }) {
  const mesh = useRef();
  
  // Rotation based on direction
  const getRotation = () => {
    if (direction.x === 1) return [0, Math.PI / 2, 0]; // right
    if (direction.x === -1) return [0, -Math.PI / 2, 0]; // left
    if (direction.y === 1) return [Math.PI / 2, 0, 0]; // down
    return [-Math.PI / 2, 0, 0]; // up
  };
  
  return (
    <group position={[position.x, 0.5, position.y]} rotation={getRotation()}>
      <mesh ref={mesh} castShadow>
        <capsuleGeometry args={[0.4, 0.4, 8, 16]} />
        <meshStandardMaterial color="#2a723a" roughness={0.5} metalness={0.2} />
      </mesh>
      
      {/* Left eye */}
      <group position={[0.25, 0.2, -0.35]}>
        <mesh castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#e1e09e" roughness={0.1} metalness={0.2} />
        </mesh>
        {/* Pupil */}
        <mesh position={[0, 0, 0.06]}>
          <ellipsisGeometry args={[0.03, 0.08]} />
          <meshBasicMaterial color="black" />
        </mesh>
        {/* Shine */}
        <mesh position={[-0.05, 0.05, 0.1]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </group>
      
      {/* Right eye */}
      <group position={[-0.25, 0.2, -0.35]}>
        <mesh castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#e1e09e" roughness={0.1} metalness={0.2} />
        </mesh>
        {/* Pupil */}
        <mesh position={[0, 0, 0.06]}>
          <ellipsisGeometry args={[0.03, 0.08]} />
          <meshBasicMaterial color="black" />
        </mesh>
        {/* Shine */}
        <mesh position={[-0.05, 0.05, 0.1]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </group>
    </group>
  );
}

function SnakeBodySegment({ position, index }) {
  // Vary size and color based on segment index for tapering effect
  const scale = Math.max(0.85, 1 - index * 0.015);
  const greenValue = 0.2 + index * 0.025;
  const color = new THREE.Color(0.1, Math.min(0.5, greenValue), 0.1);
  
  return (
    <mesh 
      position={[position.x, 0.4 * scale, position.y]} 
      castShadow
    >
      <sphereGeometry args={[0.45 * scale, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.6} 
        metalness={0.1}
      />
    </mesh>
  );
}

function Food({ position }) {
  const group = useRef();
  
  // Animate the food floating effect
  useEffect(() => {
    if (!group.current) return;
    
    const interval = setInterval(() => {
      if (group.current) {
        group.current.rotation.y += 0.01;
      }
    }, 16);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <group 
      ref={group} 
      position={[position.x, 0.5, position.y]}
    >
      {/* Base fruit */}
      <mesh castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial 
          color="#5db649" 
          emissive="#5db649"
          emissiveIntensity={0.2}
          roughness={0.3} 
          metalness={0.2}
        />
      </mesh>
      
      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial 
          color="#8aff8a" 
          transparent={true} 
          opacity={0.2} 
        />
      </mesh>
      
      {/* Stem */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
        <meshStandardMaterial color="#2e5c1e" />
      </mesh>
      
      {/* Leaf */}
      <mesh position={[0.1, 0.4, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <sphereGeometry args={[0.1, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3d7a31" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Ground({ boardSize }) {
  // Use a texture for the ground
  const texture = useTexture({
    map: "/textures/grass.jpg",
    displacementMap: "/textures/grass_height.jpg",
    normalMap: "/textures/grass_normal.jpg",
    roughnessMap: "/textures/grass_roughness.jpg",
    aoMap: "/textures/grass_ao.jpg",
  });
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[boardSize.width/2 - 0.5, 0, boardSize.height/2 - 0.5]}>
      <planeGeometry args={[boardSize.width + 5, boardSize.height + 5, 32, 32]} />
      <meshStandardMaterial 
        {...texture} 
        color="#1a331a"
        displacementScale={0.5}
        metalness={0.1}
        roughness={0.8}
      />
    </mesh>
  );
}

function GridLines({ boardSize }) {
  const width = boardSize.width;
  const height = boardSize.height;
  const gridLines = [];
  
  // Create vertical lines
  for (let i = 0; i <= width; i++) {
    gridLines.push(
      <line 
        key={`v${i}`}
        position={[0, 0.01, 0]}
      >
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([i, 0, 0, i, 0, height])}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#1d4a1d" transparent opacity={0.3} />
      </line>
    );
  }
  
  // Create horizontal lines
  for (let i = 0; i <= height; i++) {
    gridLines.push(
      <line 
        key={`h${i}`}
        position={[0, 0.01, 0]}
      >
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([0, 0, i, width, 0, i])}
            count={2}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#1d4a1d" transparent opacity={0.3} />
      </line>
    );
  }
  
  return <group>{gridLines}</group>;
}

function Environment3D() {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} />
      <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
      <ambientLight intensity={0.2} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={0.5} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} distance={20} />
    </>
  );
}

function Scene3D() {
  const { 
    snake, 
    food, 
    gamePhase, 
    direction, 
    updateGame 
  } = useSnakeGame();
  
  const { playMove, playSuccess, playHit } = useAudio();
  const [cameraPosition, setCameraPosition] = useState([snake.boardSize.width/2, 20, snake.boardSize.height + 5]);
  const intervalRef = useRef(null);
  
  // Use game loop
  useEffect(() => {
    if (gamePhase !== "playing") return;
    
    // Get the game speed based on difficulty
    const gameSpeed = 1000 - (direction === "easy" ? 800 : direction === "medium" ? 600 : 400);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      const result = updateGame();
      
      if (result === "eat") {
        playSuccess();
      } else if (result === "collision") {
        playHit();
        clearInterval(intervalRef.current);
      } else if (result === "move") {
        playMove();
      }
    }, gameSpeed);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gamePhase, updateGame, direction, playSuccess, playHit, playMove]);
  
  // Adjust camera when snake moves
  useEffect(() => {
    if (snake.body.length === 0) return;
    
    const head = snake.body[0];
    setCameraPosition([
      snake.boardSize.width/2,
      20,
      snake.boardSize.height + 5
    ]);
  }, [snake]);
  
  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={cameraPosition} 
        fov={50}
        lookAt={[snake.boardSize.width/2, 0, snake.boardSize.height/2]}
      />
      
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={40}
      />
      
      <Environment3D />
      
      <Ground boardSize={snake.boardSize} />
      <GridLines boardSize={snake.boardSize} />
      
      {/* Render Snake */}
      <SnakeHead 
        position={snake.body[0]} 
        direction={direction}
      />
      
      {snake.body.slice(1).map((segment, index) => (
        <SnakeBodySegment 
          key={`segment-${index}`}
          position={segment}
          index={index}
        />
      ))}
      
      {/* Render Food */}
      <Food position={food} />
    </>
  );
}

export default function SnakeGame3D() {
  const { phase, start, restart } = useGame();
  const { score, setDifficulty, restartGame } = useSnakeGame();
  
  // Connect game phase state between zustand stores
  useEffect(() => {
    if (phase === "playing") {
      restartGame(); // Reset snake game state when main game starts
    }
  }, [phase, restartGame]);
  
  // Handle restart action between stores
  const handleRestart = () => {
    restartGame();
    restart();
  };
  
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-3xl mx-auto">
      <div className="w-full px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Snake 3D</h2>
          
          {phase !== "ended" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Difficulty:</span>
              <select 
                className="p-2 bg-background border border-border rounded-md text-sm"
                onChange={(e) => setDifficulty(e.target.value as any)}
                disabled={phase === "playing"}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          )}
        </div>
        
        {/* Game container */}
        <div className="relative w-full aspect-square rounded-md overflow-hidden border border-border shadow-md bg-black">
          <Canvas shadows dpr={[1, 2]}>
            <Scene3D />
          </Canvas>
          
          {/* Overlay for game states */}
          {phase === "ready" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <button
                onClick={start}
                className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md shadow-lg hover:bg-primary/90 transition-colors text-lg"
              >
                Start 3D Game
              </button>
            </div>
          )}
          
          {phase === "ended" && (
            <GameOverScreen score={score} onRestart={handleRestart} />
          )}
        </div>
        
        {/* Score display */}
        <div className="mt-4 flex justify-center">
          <div className="px-4 py-2 bg-muted rounded-full text-lg font-medium">
            Score: {score}
          </div>
        </div>
      </div>
      
      {/* Mobile controls for touch devices */}
      <GameControls />
      
      {/* Instructions */}
      <div className="mt-4 p-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
        <p>Use arrow keys or WASD to control the snake.</p>
        <p className="mt-1">You can rotate and zoom the 3D view using mouse or touch gestures.</p>
      </div>
    </div>
  );
}