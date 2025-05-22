import { useEffect, useState } from "react";
import { useSnakeGame } from "@/lib/stores/useSnakeGame";
import { useAudio } from "@/lib/stores/useAudio";
import GameCanvas from "./GameCanvas";
import GameControls from "./GameControls";
import GameOverScreen from "./GameOverScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function SnakeGame() {
  const { 
    score,
    gamePhase,
    startGame,
    restartGame
  } = useSnakeGame();
  
  const { 
    isMuted, 
    toggleMute, 
    setHitSound, 
    setSuccessSound 
  } = useAudio();
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Load sound effects
  useEffect(() => {
    // Only load sounds once
    if (isInitialized) return;
    
    try {
      const hitSoundEffect = new Audio("/sounds/hit.mp3");
      const successSoundEffect = new Audio("/sounds/success.mp3");
      
      setHitSound(hitSoundEffect);
      setSuccessSound(successSoundEffect);
      
      setIsInitialized(true);
      
      console.log("Sound effects loaded successfully");
    } catch (error) {
      console.error("Failed to load sound effects:", error);
    }
  }, [isInitialized, setHitSound, setSuccessSound]);

  return (
    <Card className={cn(
      "w-full max-w-2xl shadow-xl transition-all duration-300",
      gamePhase === "playing" ? "bg-card/80" : "bg-card"
    )}>
      <CardHeader className="space-y-1 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Snake Game</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id="mute-toggle"
              checked={!isMuted}
              onCheckedChange={toggleMute}
            />
            <Label htmlFor="mute-toggle">Sound</Label>
          </div>
        </div>
        <div className="text-2xl font-bold text-primary">
          Score: {score}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {gamePhase === "ended" ? (
          <GameOverScreen score={score} onRestart={restartGame} />
        ) : (
          <GameCanvas />
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-4 pt-2">
        {gamePhase === "ready" && (
          <Button 
            className="w-full text-lg py-6"
            onClick={startGame}
          >
            Start Game
          </Button>
        )}
        
        <GameControls />
      </CardFooter>
    </Card>
  );
}
