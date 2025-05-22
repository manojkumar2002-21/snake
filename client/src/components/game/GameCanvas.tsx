import { useEffect, useRef } from "react";
import { useSnakeGame } from "@/lib/stores/useSnakeGame";
import { useAudio } from "@/lib/stores/useAudio";

// Game constants
const CELL_SIZE = 20; // Size of each cell in pixels
// Game speed is now controlled by the difficulty level in the useSnakeGame store

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    gamePhase,
    snake,
    food,
    direction,
    setDirection,
    updateGame,
    endGame,
    getGameSpeed
  } = useSnakeGame();
  
  const { playHit, playSuccess, playMove } = useAudio();

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip handling if game is not playing
      if (gamePhase !== "playing") return;
      
      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          if (direction !== "down") setDirection("up");
          break;
        case "ArrowDown":
        case "KeyS":
          if (direction !== "up") setDirection("down");
          break;
        case "ArrowLeft":
        case "KeyA":
          if (direction !== "right") setDirection("left");
          break;
        case "ArrowRight":
        case "KeyD":
          if (direction !== "left") setDirection("right");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [direction, gamePhase, setDirection]);

  // Game loop
  useEffect(() => {
    if (gamePhase !== "playing") return;
    
    // Get game speed based on current difficulty
    const gameSpeed = getGameSpeed();
    
    const gameInterval = setInterval(() => {
      const result = updateGame();
      
      // Play appropriate sounds based on game events
      if (result === "eat") {
        playSuccess();
      } else if (result === "collision") {
        playHit();
        endGame();
        clearInterval(gameInterval);
      } else if (result === "move") {
        // Play subtle movement sound as snake moves
        playMove();
      }
    }, gameSpeed);

    return () => {
      clearInterval(gameInterval);
    };
  }, [gamePhase, updateGame, endGame, playHit, playSuccess, playMove, getGameSpeed]);

  // Canvas rendering
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas dimensions based on snake board size
    const boardWidth = CELL_SIZE * snake.boardSize.width;
    const boardHeight = CELL_SIZE * snake.boardSize.height;
    canvas.width = boardWidth;
    canvas.height = boardHeight;

    // Draw dark forest-like background with realistic texture
    // Create a dark gradient background 
    const bgGradient = ctx.createLinearGradient(0, 0, 0, boardHeight);
    bgGradient.addColorStop(0, "#0a1f0a"); // Very dark green at top
    bgGradient.addColorStop(0.3, "#142a14"); // Dark forest green
    bgGradient.addColorStop(0.7, "#1a331a"); // Slightly lighter green
    bgGradient.addColorStop(1, "#0f1f0f"); // Dark green at bottom
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, boardWidth, boardHeight);
    
    // Add forest texture pattern with more realistic details
    ctx.strokeStyle = "#1d4a1d"; // Dark green grass highlights
    ctx.lineWidth = 0.7;
    
    // Draw realistic forest ground details
    // More detailed grass/fern patches for forest floor
    for (let i = 0; i < 60; i++) {
      const x = Math.floor(Math.random() * boardWidth);
      const y = Math.floor(Math.random() * boardHeight);
      const size = 4 + Math.random() * 10;
      
      // Create more varied ground details
      for (let j = 0; j < 4; j++) {
        const bladeX = x + Math.random() * 8 - 4;
        const bladeHeight = 3 + Math.random() * size;
        
        // Vary color slightly for realism
        ctx.strokeStyle = j % 2 === 0 
          ? "#1d4a1d" // Dark green
          : "#2a552a"; // Slightly lighter green
          
        ctx.beginPath();
        ctx.moveTo(bladeX, y);
        // More natural curves for grass/ferns
        ctx.quadraticCurveTo(
          bladeX + (Math.random() * 5 - 2.5), 
          y - bladeHeight/2, 
          bladeX + (Math.random() * 3 - 1.5), 
          y - bladeHeight
        );
        ctx.stroke();
      }
      
      // Add some scattered small rocks/details
      if (i % 8 === 0) {
        ctx.fillStyle = "rgba(40, 40, 40, 0.5)";
        ctx.beginPath();
        ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Draw subtle grid lines (more subdued for dark theme)
    ctx.strokeStyle = "rgba(45, 75, 45, 0.2)";
    ctx.lineWidth = 0.2;
    
    // Vertical lines
    for (let x = 0; x <= boardWidth; x += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, boardHeight);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= boardHeight; y += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(boardWidth, y);
      ctx.stroke();
    }
    
    // Add some scattered environmental highlights for depth
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * boardWidth);
      const y = Math.floor(Math.random() * boardHeight);
      
      // Small light spots (moonlight through trees)
      ctx.fillStyle = "rgba(180, 230, 180, 0.03)";
      ctx.beginPath();
      ctx.arc(x, y, 5 + Math.random() * 15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw realistic glowing forest fruit (more exotic for dark theme)
    const foodX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const foodY = food.y * CELL_SIZE + CELL_SIZE / 2;
    const foodRadius = CELL_SIZE / 2 - 2;
    
    // Add subtle glow effect around food
    const glowRadius = foodRadius * 1.8;
    const glowGradient = ctx.createRadialGradient(
      foodX, foodY, 0,
      foodX, foodY, glowRadius
    );
    glowGradient.addColorStop(0, "rgba(140, 230, 140, 0.2)");
    glowGradient.addColorStop(0.5, "rgba(120, 220, 120, 0.1)");
    glowGradient.addColorStop(1, "rgba(100, 200, 100, 0)");
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(foodX, foodY, glowRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Exotic forest fruit body with rich color gradient
    const fruitGradient = ctx.createRadialGradient(
      foodX - foodRadius/3, foodY - foodRadius/3, foodRadius/10,
      foodX, foodY, foodRadius
    );
    fruitGradient.addColorStop(0, "#9eff6e"); // Bright center
    fruitGradient.addColorStop(0.5, "#5db649"); // Midtone green
    fruitGradient.addColorStop(1, "#3d7a31"); // Darker edge
    
    ctx.fillStyle = fruitGradient;
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add stem and leaf
    ctx.fillStyle = "#2e5c1e";
    ctx.fillRect(foodX - 1, foodY - foodRadius - 3, 2, 4);
    
    // Draw small leaf
    ctx.fillStyle = "#3d7a31";
    ctx.beginPath();
    ctx.ellipse(
      foodX + 3, 
      foodY - foodRadius - 2, 
      3, 1.5, 
      Math.PI/4, 0, 2 * Math.PI
    );
    ctx.fill();
    
    // Add shine/highlight for a glossy look
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.ellipse(
      foodX - foodRadius/3, 
      foodY - foodRadius/3, 
      foodRadius/2, 
      foodRadius/4, 
      Math.PI/4, 
      0, 
      2 * Math.PI
    );
    ctx.fill();
    
    // Add smaller secondary highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(
      foodX + foodRadius/3, 
      foodY + foodRadius/3, 
      foodRadius/5, 
      0, 
      2 * Math.PI
    );
    ctx.fill();

    // Draw snake with realistic, smooth body segments
    snake.body.forEach((segment, index) => {
      const x = segment.x * CELL_SIZE;
      const y = segment.y * CELL_SIZE;
      const centerX = x + CELL_SIZE/2;
      const centerY = y + CELL_SIZE/2;
      
      if (index === 0) {
        // Draw snake head with more realistic coloring
        // Create head gradient for a more natural look
        const headGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, CELL_SIZE/2
        );
        headGradient.addColorStop(0, "#2A723A"); // Center color
        headGradient.addColorStop(0.7, "#225530"); // Mid tone
        headGradient.addColorStop(1, "#1A4025"); // Edge color
        
        ctx.fillStyle = headGradient;
        
        // Draw snake head with slight oval shape in direction of movement
        ctx.beginPath();
        
        // Adjust head shape based on movement direction
        if (direction === "left" || direction === "right") {
          // Slightly oval for horizontal movement
          ctx.ellipse(
            centerX, 
            centerY, 
            CELL_SIZE/2, 
            CELL_SIZE/2 - 2, 
            0, 0, Math.PI * 2
          );
        } else {
          // Slightly oval for vertical movement
          ctx.ellipse(
            centerX, 
            centerY, 
            CELL_SIZE/2 - 2, 
            CELL_SIZE/2, 
            0, 0, Math.PI * 2
          );
        }
        ctx.fill();
        
        // Add texture details to head
        ctx.fillStyle = "rgba(15, 40, 15, 0.3)";
        ctx.beginPath();
        ctx.ellipse(
          centerX, 
          centerY - CELL_SIZE/6, 
          CELL_SIZE/3, 
          CELL_SIZE/5, 
          0, 0, Math.PI
        );
        ctx.fill();
        
        // Add realistic eyes - smaller and more snake-like
        const eyeSize = CELL_SIZE / 7;
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        // Position eyes based on direction
        switch(direction) {
          case "up":
            leftEyeX = centerX - CELL_SIZE/4;
            leftEyeY = centerY - CELL_SIZE/6;
            rightEyeX = centerX + CELL_SIZE/4;
            rightEyeY = centerY - CELL_SIZE/6;
            break;
          case "down":
            leftEyeX = centerX - CELL_SIZE/4;
            leftEyeY = centerY + CELL_SIZE/6;
            rightEyeX = centerX + CELL_SIZE/4;
            rightEyeY = centerY + CELL_SIZE/6;
            break;
          case "left":
            leftEyeX = centerX - CELL_SIZE/6;
            leftEyeY = centerY - CELL_SIZE/4;
            rightEyeX = centerX - CELL_SIZE/6;
            rightEyeY = centerY + CELL_SIZE/4;
            break;
          case "right":
            leftEyeX = centerX + CELL_SIZE/6;
            leftEyeY = centerY - CELL_SIZE/4;
            rightEyeX = centerX + CELL_SIZE/6;
            rightEyeY = centerY + CELL_SIZE/4;
            break;
        }
        
        // Create reptilian eye effect - elongated pupils
        // First draw the base eye color
        const eyeGradient = ctx.createRadialGradient(
          leftEyeX, leftEyeY, 0,
          leftEyeX, leftEyeY, eyeSize
        );
        eyeGradient.addColorStop(0, "#e1e09e"); // Light yellow
        eyeGradient.addColorStop(0.8, "#ceca76"); // Yellow-green
        eyeGradient.addColorStop(1, "#a8a457"); // Darker edge
        
        ctx.fillStyle = eyeGradient;
        
        // Left eye with slight oval shape
        ctx.beginPath();
        ctx.ellipse(leftEyeX, leftEyeY, eyeSize, eyeSize*0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.ellipse(rightEyeX, rightEyeY, eyeSize, eyeSize*0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw vertical slit pupils
        ctx.fillStyle = "black";
        
        // Determine pupil angle based on direction
        let pupilAngle = 0;
        switch(direction) {
          case "up":
          case "down": 
            pupilAngle = 0; break;
          case "left":
          case "right": 
            pupilAngle = Math.PI/2; break;
        }
        
        // Left eye pupil
        ctx.beginPath();
        ctx.ellipse(
          leftEyeX, leftEyeY, 
          eyeSize*0.2, eyeSize*0.7, 
          pupilAngle, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Right eye pupil
        ctx.beginPath();
        ctx.ellipse(
          rightEyeX, rightEyeY, 
          eyeSize*0.2, eyeSize*0.7, 
          pupilAngle, 0, Math.PI * 2
        );
        ctx.fill();
        
        // Add shine to eyes for realism
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(leftEyeX - eyeSize/4, leftEyeY - eyeSize/4, eyeSize/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX - eyeSize/4, rightEyeY - eyeSize/4, eyeSize/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Create more realistic and animated tongue flicking
        if (Date.now() % 3000 < 300) {
          // Use linear gradient for tongue for more realistic coloring
          let tongueGradient;
          let tongueStartX = centerX;
          let tongueStartY = centerY;
          let tongueEndX, tongueEndY;
          const tongueLength = CELL_SIZE * 0.8;
          
          // Adjust tongue start position based on direction
          switch(direction) {
            case "up":
              tongueStartY = y;
              tongueEndY = y - tongueLength;
              tongueEndX = centerX;
              tongueGradient = ctx.createLinearGradient(
                tongueStartX, tongueStartY,
                tongueEndX, tongueEndY
              );
              break;
            case "down":
              tongueStartY = y + CELL_SIZE;
              tongueEndY = y + CELL_SIZE + tongueLength;
              tongueEndX = centerX;
              tongueGradient = ctx.createLinearGradient(
                tongueStartX, tongueStartY,
                tongueEndX, tongueEndY
              );
              break;
            case "left":
              tongueStartX = x;
              tongueEndX = x - tongueLength;
              tongueEndY = centerY;
              tongueGradient = ctx.createLinearGradient(
                tongueStartX, tongueStartY,
                tongueEndX, tongueEndY
              );
              break;
            case "right":
              tongueStartX = x + CELL_SIZE;
              tongueEndX = x + CELL_SIZE + tongueLength;
              tongueEndY = centerY;
              tongueGradient = ctx.createLinearGradient(
                tongueStartX, tongueStartY,
                tongueEndX, tongueEndY
              );
              break;
          }
          
          // Create realistic tongue coloring
          tongueGradient.addColorStop(0, "#d12638"); // Deep red at base
          tongueGradient.addColorStop(0.7, "#ec485c"); // Brighter red toward tip
          tongueGradient.addColorStop(1, "#f25e70"); // Lightest at tip
          
          // Use thicker lines for tongue base, thinner for tips
          ctx.lineCap = "round";
          
          // Add subtle wiggle effect that's more organic
          const wiggleSpeed = Date.now() / 80; // Faster flickering
          const wiggle = Math.sin(wiggleSpeed) * 2.5;
          const wiggle2 = Math.sin(wiggleSpeed + 1) * 1.5; // Slightly out of phase
          
          // Determine fork spread based on direction
          let forkSpread;
          if (direction === "up" || direction === "down") {
            forkSpread = tongueLength/3;
          } else {
            forkSpread = tongueLength/3;
          }
          
          // Calculate tongue midpoint for forking
          const tongueMidX = direction === "left" 
            ? tongueStartX - tongueLength * 0.6
            : direction === "right"
              ? tongueStartX + tongueLength * 0.6
              : tongueStartX;
              
          const tongueMidY = direction === "up"
            ? tongueStartY - tongueLength * 0.6
            : direction === "down"
              ? tongueStartY + tongueLength * 0.6
              : tongueStartY;
          
          // Draw the main tongue line
          ctx.beginPath();
          ctx.strokeStyle = tongueGradient;
          ctx.lineWidth = 2;
          ctx.moveTo(tongueStartX, tongueStartY);
          
          // Add curve to tongue for more realism
          if (direction === "up") {
            // Curved path for tongue base
            ctx.quadraticCurveTo(
              tongueStartX + wiggle/2, tongueStartY - tongueLength * 0.3,
              tongueMidX, tongueMidY
            );
          } else if (direction === "down") {
            ctx.quadraticCurveTo(
              tongueStartX + wiggle/2, tongueStartY + tongueLength * 0.3,
              tongueMidX, tongueMidY
            );
          } else if (direction === "left") {
            ctx.quadraticCurveTo(
              tongueStartX - tongueLength * 0.3, tongueStartY + wiggle/2,
              tongueMidX, tongueMidY
            );
          } else { // right
            ctx.quadraticCurveTo(
              tongueStartX + tongueLength * 0.3, tongueStartY + wiggle/2,
              tongueMidX, tongueMidY
            );
          }
          ctx.stroke();
          
          // Draw the forked tips with thinner lines
          ctx.lineWidth = 1.2;
          
          // Draw first fork
          ctx.beginPath();
          ctx.moveTo(tongueMidX, tongueMidY);
          
          if (direction === "up") {
            ctx.lineTo(tongueMidX - forkSpread + wiggle2, tongueMidY - tongueLength/3);
          } else if (direction === "down") {
            ctx.lineTo(tongueMidX - forkSpread + wiggle2, tongueMidY + tongueLength/3);
          } else if (direction === "left") {
            ctx.lineTo(tongueMidX - tongueLength/3, tongueMidY - forkSpread + wiggle2);
          } else { // right
            ctx.lineTo(tongueMidX + tongueLength/3, tongueMidY - forkSpread + wiggle2);
          }
          ctx.stroke();
          
          // Draw second fork
          ctx.beginPath();
          ctx.moveTo(tongueMidX, tongueMidY);
          
          if (direction === "up") {
            ctx.lineTo(tongueMidX + forkSpread + wiggle, tongueMidY - tongueLength/3);
          } else if (direction === "down") {
            ctx.lineTo(tongueMidX + forkSpread + wiggle, tongueMidY + tongueLength/3);
          } else if (direction === "left") {
            ctx.lineTo(tongueMidX - tongueLength/3, tongueMidY + forkSpread + wiggle);
          } else { // right
            ctx.lineTo(tongueMidX + tongueLength/3, tongueMidY + forkSpread + wiggle);
          }
          ctx.stroke();
          
          // Reset line cap
          ctx.lineCap = "butt";
        }
      } else {
        // Create body gradient for more realistic coloring that tapers toward tail
        // Darker, more natural snake color palette for dark theme
        const snakeGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, CELL_SIZE/2
        );
        
        // Calculate gradient colors based on position in snake body
        // Darker forest green for first segments, gradually lightening
        const baseHue = 120; // Green hue
        const baseSat = 60 + Math.min(30, index * 2); // Saturation increases slightly toward tail
        const baseLightness = Math.min(28 + index * 1.2, 42); // Gradually gets lighter 
        
        // Create gradient for snake segment
        snakeGradient.addColorStop(0, `hsl(${baseHue}, ${baseSat}%, ${baseLightness + 5}%)`); // Center
        snakeGradient.addColorStop(0.7, `hsl(${baseHue}, ${baseSat}%, ${baseLightness}%)`); // Mid
        snakeGradient.addColorStop(1, `hsl(${baseHue}, ${baseSat}%, ${baseLightness - 5}%)`); // Edge
        
        ctx.fillStyle = snakeGradient;
        
        // Calculate snake curvature and segment size for more natural movement
        // Draw slightly smaller segments toward tail for tapering effect
        const radius = CELL_SIZE/2 - 1 - (index * 0.08);
        
        // Draw body segment 
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add realistic scale texture to body segments with more defined pattern
        if (index > 0) {
          // Scale pattern density - more scales toward head, fewer toward tail
          const scaleCount = Math.max(3, 7 - Math.floor(index / 4));
          const scaleOffset = CELL_SIZE * 0.35;
          
          // Create subtle darker scales
          ctx.fillStyle = `hsla(${baseHue}, ${baseSat + 5}%, ${baseLightness - 12}%, 0.5)`;
          
          // Create diamond-like scale pattern
          for (let j = 0; j < scaleCount; j++) {
            const angle = (j / scaleCount) * Math.PI * 2;
            // Slightly offset scales to create more natural pattern
            const scaleX = centerX + Math.cos(angle) * scaleOffset;
            const scaleY = centerY + Math.sin(angle) * scaleOffset;
            
            const scaleRadius = 1.3;
            
            // Draw scales
            ctx.beginPath();
            
            // Use elongated shapes for more realistic scales
            const scaleAngle = angle + Math.PI/4; // Rotate 45 degrees
            ctx.ellipse(
              scaleX, 
              scaleY, 
              scaleRadius * 1.5, 
              scaleRadius * 0.8, 
              scaleAngle, 
              0, Math.PI * 2
            );
            ctx.fill();
          }
          
          // Add subtle highlights for dimension
          if (index % 3 === 0) {
            ctx.fillStyle = `hsla(${baseHue}, ${baseSat - 10}%, ${baseLightness + 15}%, 0.1)`;
            ctx.beginPath();
            ctx.arc(
              centerX + radius * 0.3, 
              centerY - radius * 0.3, 
              radius * 0.5, 
              0, Math.PI * 2
            );
            ctx.fill();
          }
        }
      }
    });

  }, [snake, food, direction, gamePhase]);

  return (
    <div className="relative w-full flex justify-center">
      <canvas 
        ref={canvasRef} 
        className="border border-border rounded-md shadow-md max-w-full"
        style={{ touchAction: "none" }}
      />
      
      {gamePhase === "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
          <div className="text-center p-4">
            <h3 className="text-xl font-bold mb-2">Ready to Play?</h3>
            <p className="text-muted-foreground">Press Start Game to begin!</p>
          </div>
        </div>
      )}
    </div>
  );
}