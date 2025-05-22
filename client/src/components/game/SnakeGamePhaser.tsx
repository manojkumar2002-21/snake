import { useEffect } from "react";
import { useSnakeGame } from "@/lib/stores/useSnakeGame";
import { useGame } from "@/lib/stores/useGame";
import GameControls from "./GameControls";
import GameOverScreen from "./GameOverScreen";
import PhaserGame from "./PhaserGame";

export default function SnakeGamePhaser() {
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
          <h2 className="text-2xl font-bold">Snake Game</h2>
          
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
        <div className="relative">
          <PhaserGame />
          
          {/* Overlay for game states */}
          {phase === "ready" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={start}
                className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md shadow-lg hover:bg-primary/90 transition-colors text-lg"
              >
                Start Game
              </button>
            </div>
          )}
          
          {phase === "ended" && (
            <GameOverScreen score={score} onRestart={handleRestart} />
          )}
        </div>
      </div>
      
      {/* Mobile controls for touch devices */}
      <GameControls />
    </div>
  );
}