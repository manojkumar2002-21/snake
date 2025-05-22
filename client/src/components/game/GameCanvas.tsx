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

    // Draw grass-like background 
    // Create a gradient background (light green to darker green)
    const bgGradient = ctx.createLinearGradient(0, 0, 0, boardHeight);
    bgGradient.addColorStop(0, "#e1f5c4");
    bgGradient.addColorStop(1, "#c7e9b0");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, boardWidth, boardHeight);
    
    // Add grass texture pattern
    ctx.strokeStyle = "#97cc76";
    ctx.lineWidth = 0.7;
    
    // Draw subtle grass patches
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(Math.random() * boardWidth);
      const y = Math.floor(Math.random() * boardHeight);
      const size = 5 + Math.random() * 8;
      
      // Each patch has multiple blades
      for (let j = 0; j < 3; j++) {
        const bladeX = x + Math.random() * 5 - 2.5;
        const bladeHeight = 3 + Math.random() * size;
        
        ctx.beginPath();
        ctx.moveTo(bladeX, y);
        ctx.quadraticCurveTo(
          bladeX + (Math.random() * 4 - 2), 
          y - bladeHeight/2, 
          bladeX + (Math.random() * 2 - 1), 
          y - bladeHeight
        );
        ctx.stroke();
      }
    }
    
    // Draw subtle grid lines for gameplay clarity
    ctx.strokeStyle = "rgba(150, 200, 120, 0.3)";
    ctx.lineWidth = 0.3;
    
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

    // Draw realistic apple-like food
    const foodX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const foodY = food.y * CELL_SIZE + CELL_SIZE / 2;
    const foodRadius = CELL_SIZE / 2 - 2;
    
    // Apple body (red with gradient)
    const gradient = ctx.createRadialGradient(
      foodX - foodRadius/3, foodY - foodRadius/3, foodRadius/10,
      foodX, foodY, foodRadius
    );
    gradient.addColorStop(0, "#ff5e3a");
    gradient.addColorStop(0.5, "#e41e25");
    gradient.addColorStop(1, "#c41c23");
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add stem
    ctx.fillStyle = "#553311";
    ctx.fillRect(foodX - 1, foodY - foodRadius - 3, 2, 4);
    
    // Add shine/highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
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

    // Draw snake with realistic, smooth body segments
    snake.body.forEach((segment, index) => {
      const x = segment.x * CELL_SIZE;
      const y = segment.y * CELL_SIZE;
      const centerX = x + CELL_SIZE/2;
      const centerY = y + CELL_SIZE/2;
      
      if (index === 0) {
        // Head segment - darker green
        ctx.fillStyle = "#2C8A32";
        
        // Draw snake head
        ctx.beginPath();
        ctx.arc(centerX, centerY, CELL_SIZE/2 - 1, 0, Math.PI * 2);
        ctx.fill();
        
        // Add realistic eyes
        const eyeSize = CELL_SIZE / 6;
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
        
        // Draw black eyes
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Add white reflection to eyes for realism
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(leftEyeX - eyeSize/3, leftEyeY - eyeSize/3, eyeSize/3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX - eyeSize/3, rightEyeY - eyeSize/3, eyeSize/3, 0, Math.PI * 2);
        ctx.fill();
        
        // Occasionally show tongue flicking (every few seconds)
        if (Date.now() % 3000 < 300) {
          ctx.strokeStyle = "#e74c3c"; // Red tongue
          ctx.lineWidth = 1.5;
          
          // Position tongue based on direction
          let tongueStartX = centerX;
          let tongueStartY = centerY;
          const tongueLength = CELL_SIZE * 0.7;
          
          // Adjust tongue start position based on direction
          switch(direction) {
            case "up":
              tongueStartY = y;
              break;
            case "down":
              tongueStartY = y + CELL_SIZE;
              break;
            case "left":
              tongueStartX = x;
              break;
            case "right":
              tongueStartX = x + CELL_SIZE;
              break;
          }
          
          // Add subtle wiggle effect
          const wiggle = Math.sin(Date.now() / 100) * 2;
          
          // Draw forked tongue based on direction
          if (direction === "up") {
            // Left fork
            ctx.beginPath();
            ctx.moveTo(tongueStartX, tongueStartY);
            ctx.lineTo(tongueStartX - tongueLength/3, tongueStartY - tongueLength/2 + wiggle);
            ctx.stroke();
            
            // Right fork
            ctx.beginPath();
            ctx.moveTo(tongueStartX, tongueStartY);
            ctx.lineTo(tongueStartX + tongueLength/3, tongueStartY - tongueLength/2 + wiggle);
            ctx.stroke();
          } else if (direction === "down") {
            // Left fork
            ctx.beginPath();
            ctx.moveTo(tongueStartX, tongueStartY);
            ctx.lineTo(tongueStartX - tongueLength/3, tongueStartY + tongueLength/2 + wiggle);
            ctx.stroke();
            
            // Right fork
            ctx.beginPath();
            ctx.moveTo(tongueStartX, tongueStartY);
            ctx.lineTo(tongueStartX + tongueLength/3, tongueStartY + tongueLength/2 + wiggle);
            ctx.stroke();
          } else if (direction === "left") {
            // Upper fork
            ctx.beginPath();
            ctx.moveTo(tongueStartX, tongueStartY);
            ctx.lineTo(tongueStartX - tongueLength/2, tongueStartY - tongueLength/3 + wiggle);
            ctx.stroke();
            
            // Lower fork
            ctx.beginPath();
            ctx.moveTo(tongueStartX, tongueStartY);
            ctx.lineTo(tongueStartX - tongueLength/2, tongueStartY + tongueLength/3 + wiggle);
            ctx.stroke();
          } else { // right
            // Upper fork
            ctx.beginPath();
            ctx.moveTo(tongueStartX, tongueStartY);
            ctx.lineTo(tongueStartX + tongueLength/2, tongueStartY - tongueLength/3 + wiggle);
            ctx.stroke();
            
            // Lower fork
            ctx.beginPath();
            ctx.moveTo(tongueStartX, tongueStartY);
            ctx.lineTo(tongueStartX + tongueLength/2, tongueStartY + tongueLength/3 + wiggle);
            ctx.stroke();
          }
        }
      } else {
        // Body segments - gradient color toward tail
        const colorValue = Math.min(95, 65 + index * 2);
        ctx.fillStyle = `hsl(103, 85%, ${colorValue}%)`;
        
        // Draw slightly smaller segments toward tail for tapering effect
        const radius = CELL_SIZE/2 - 1 - (index * 0.05);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add subtle scale texture to body segments
        if (index > 0 && index < 8) {
          ctx.fillStyle = `hsla(103, 85%, ${colorValue - 10}%, 0.3)`;
          
          // Create scale pattern with small arcs
          const scaleRadius = 1.5;
          const scaleCount = 5;
          const scaleOffset = CELL_SIZE * 0.3;
          
          for (let j = 0; j < scaleCount; j++) {
            const angle = (j / scaleCount) * Math.PI * 2;
            const scaleX = centerX + Math.cos(angle) * scaleOffset;
            const scaleY = centerY + Math.sin(angle) * scaleOffset;
            
            ctx.beginPath();
            ctx.arc(scaleX, scaleY, scaleRadius, 0, Math.PI * 2);
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