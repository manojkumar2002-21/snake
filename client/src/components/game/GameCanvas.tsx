import { useEffect, useRef } from "react";
import { useSnakeGame } from "@/lib/stores/useSnakeGame";
import { useAudio } from "@/lib/stores/useAudio";

// Game constants
const CELL_SIZE = 20; // Size of each cell in pixels
const GAME_SPEED = 100; // Update interval in milliseconds

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
  
  const { playHit, playSuccess } = useAudio();

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

    // Draw background grid
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, boardWidth, boardHeight);
    
    // Draw grid lines
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 0.5;
    
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

    // Draw food
    ctx.fillStyle = "#ff4d4f";
    ctx.beginPath();
    const foodX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const foodY = food.y * CELL_SIZE + CELL_SIZE / 2;
    ctx.arc(foodX, foodY, CELL_SIZE / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();

    // Draw snake body segments
    snake.body.forEach((segment, index) => {
      // Head has a different color
      if (index === 0) {
        ctx.fillStyle = "#389e0d";
      } else {
        // Create a gradient from dark to light green for the body
        const greenIntensity = Math.max(60, 100 - index * 2);
        ctx.fillStyle = `hsl(103, 80%, ${greenIntensity}%)`;
      }
      
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
      
      // Add eyes to the head
      if (index === 0) {
        ctx.fillStyle = "#fff";
        const eyeSize = CELL_SIZE / 6;
        const eyeOffset = CELL_SIZE / 4;
        
        // Position eyes based on direction
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        switch(direction) {
          case "up":
            leftEyeX = segment.x * CELL_SIZE + eyeOffset;
            leftEyeY = segment.y * CELL_SIZE + eyeOffset;
            rightEyeX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            rightEyeY = segment.y * CELL_SIZE + eyeOffset;
            break;
          case "down":
            leftEyeX = segment.x * CELL_SIZE + eyeOffset;
            leftEyeY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            rightEyeX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            rightEyeY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            break;
          case "left":
            leftEyeX = segment.x * CELL_SIZE + eyeOffset;
            leftEyeY = segment.y * CELL_SIZE + eyeOffset;
            rightEyeX = segment.x * CELL_SIZE + eyeOffset;
            rightEyeY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            break;
          case "right":
            leftEyeX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            leftEyeY = segment.y * CELL_SIZE + eyeOffset;
            rightEyeX = segment.x * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            rightEyeY = segment.y * CELL_SIZE + CELL_SIZE - eyeOffset - eyeSize;
            break;
        }
        
        // Draw eyes
        ctx.beginPath();
        ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
        ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
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
