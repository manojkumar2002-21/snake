import { useEffect, useRef, useCallback } from "react";
import { useSnakeGame } from "@/lib/stores/useSnakeGame";
import { useAudio } from "@/lib/stores/useAudio";

// Game constants
const CELL_SIZE = 20; // Size of each cell in pixels
const GAME_SPEED = 200; // Update interval in milliseconds (slowed down for more realistic movement)

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
    score
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

    const previousScore = score;
    
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
    }, GAME_SPEED);

    return () => {
      clearInterval(gameInterval);
    };
  }, [gamePhase, updateGame, endGame, playHit, playSuccess, score]);

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

    // Draw snake body segments with rounded corners for a more realistic look
    snake.body.forEach((segment, index, segments) => {
      // Head has a different color
      if (index === 0) {
        ctx.fillStyle = "#228B22"; // Forest Green for head
      } else {
        // Create a gradient from dark to light green for the body
        // This creates a more natural snake-like appearance
        const greenIntensity = Math.max(40, 80 - index * 1.5);
        ctx.fillStyle = `hsl(103, 85%, ${greenIntensity}%)`;
      }
      
      // Draw rounded snake segments instead of squares
      const x = segment.x * CELL_SIZE;
      const y = segment.y * CELL_SIZE;
      const size = CELL_SIZE - 2;
      const radius = size / 3; // Rounded corners
      
      // Draw rounded rectangle for each segment
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + size - radius, y);
      ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
      ctx.lineTo(x + size, y + size - radius);
      ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
      ctx.lineTo(x + radius, y + size);
      ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
      
      // Add scales pattern for body segments (except head)
      if (index > 0) {
        const intensity = Math.max(40, 80 - index * 1.5);
        ctx.strokeStyle = `hsla(103, 85%, ${Math.max(30, intensity - 15)}%, 0.5)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x + size/2, y + size/3);
        ctx.lineTo(x + size/2, y + size*2/3);
        ctx.stroke();
      }
      
      // Add eyes and tongue to the head
      if (index === 0) {
        // Eyes
        ctx.fillStyle = "#000"; // Black eyes
        const eyeSize = CELL_SIZE / 5;
        const eyeOffset = CELL_SIZE / 3.5;
        
        // Position eyes based on direction
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        let tongueStartX, tongueStartY, tongueMidX, tongueMidY, tongueEndX, tongueEndY;
        
        switch(direction) {
          case "up":
            leftEyeX = segment.x * CELL_SIZE + eyeOffset;
            leftEyeY = segment.y * CELL_SIZE + eyeOffset;
            rightEyeX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            rightEyeY = segment.y * CELL_SIZE + eyeOffset;
            
            // Tongue position for up direction
            tongueStartX = x + size/2;
            tongueStartY = y;
            tongueMidX = tongueStartX;
            tongueMidY = tongueStartY - size/3;
            tongueEndX = tongueStartX - size/4;
            tongueEndY = tongueMidY - size/4;
            break;
          case "down":
            leftEyeX = segment.x * CELL_SIZE + eyeOffset;
            leftEyeY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            rightEyeX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            rightEyeY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            
            // Tongue position for down direction
            tongueStartX = x + size/2;
            tongueStartY = y + size;
            tongueMidX = tongueStartX;
            tongueMidY = tongueStartY + size/3;
            tongueEndX = tongueStartX + size/4;
            tongueEndY = tongueMidY + size/4;
            break;
          case "left":
            leftEyeX = segment.x * CELL_SIZE + eyeOffset;
            leftEyeY = segment.y * CELL_SIZE + eyeOffset;
            rightEyeX = segment.x * CELL_SIZE + eyeOffset;
            rightEyeY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            
            // Tongue position for left direction
            tongueStartX = x;
            tongueStartY = y + size/2;
            tongueMidX = tongueStartX - size/3;
            tongueMidY = tongueStartY;
            tongueEndX = tongueMidX - size/4;
            tongueEndY = tongueMidY - size/4;
            break;
          case "right":
            leftEyeX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            leftEyeY = segment.y * CELL_SIZE + eyeOffset;
            rightEyeX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            rightEyeY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            
            // Tongue position for right direction
            tongueStartX = x + size;
            tongueStartY = y + size/2;
            tongueMidX = tongueStartX + size/3;
            tongueMidY = tongueStartY;
            tongueEndX = tongueMidX + size/4;
            tongueEndY = tongueMidY + size/4;
            break;
        }
        
        // Draw eyes (circular)
        ctx.beginPath();
        ctx.arc(leftEyeX + eyeSize/2, leftEyeY + eyeSize/2, eyeSize/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX + eyeSize/2, rightEyeY + eyeSize/2, eyeSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add white reflection to eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(leftEyeX + eyeSize/2 - 1, leftEyeY + eyeSize/2 - 1, eyeSize/5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rightEyeX + eyeSize/2 - 1, rightEyeY + eyeSize/2 - 1, eyeSize/5, 0, Math.PI * 2);
        ctx.fill();
        
        // Occasionally show tongue (based on time)
        if (Date.now() % 3000 < 300) {
          // Draw forked tongue
          ctx.strokeStyle = "#FF3366";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tongueStartX, tongueStartY);
          ctx.lineTo(tongueMidX, tongueMidY);
          ctx.lineTo(tongueEndX, tongueEndY);
          ctx.stroke();
          
          // Other fork of tongue
          ctx.beginPath();
          ctx.moveTo(tongueMidX, tongueMidY);
          ctx.lineTo(tongueMidX + (tongueMidX - tongueEndX), tongueEndY);
          ctx.stroke();
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
