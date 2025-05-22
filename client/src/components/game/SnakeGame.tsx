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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX, Gauge } from "lucide-react";

export default function SnakeGame() {
  const { 
    score,
    gamePhase,
    difficulty,
    startGame,
    restartGame,
    setDifficulty
  } = useSnakeGame();
  
  const { 
    isMuted, 
    toggleMute, 
    setHitSound, 
    setSuccessSound,
    setMoveSound,
    setBackgroundMusic,
    startBackgroundMusic,
    stopBackgroundMusic
  } = useAudio();
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Load sound effects
  useEffect(() => {
    // Only load sounds once
    if (isInitialized) return;
    
    try {
      const hitSoundEffect = new Audio("/sounds/hit.mp3");
      const successSoundEffect = new Audio("/sounds/success.mp3");
      const moveSoundEffect = new Audio("/sounds/move.mp3");
      const backgroundMusicEffect = new Audio("/sounds/background.mp3");
      
      setHitSound(hitSoundEffect);
      setSuccessSound(successSoundEffect);
      setMoveSound(moveSoundEffect);
      setBackgroundMusic(backgroundMusicEffect);
      
      setIsInitialized(true);
      
      console.log("Sound effects loaded successfully");
    } catch (error) {
      console.error("Failed to load sound effects:", error);
    }
  }, [isInitialized, setHitSound, setSuccessSound, setMoveSound, setBackgroundMusic]);

  // Manage background music based on game phase
  useEffect(() => {
    if (gamePhase === "playing") {
      startBackgroundMusic();
    } else if (gamePhase === "ended") {
      stopBackgroundMusic();
    }
    
    // Clean up on component unmount
    return () => {
      stopBackgroundMusic();
    };
  }, [gamePhase, startBackgroundMusic, stopBackgroundMusic]);

  return (
    <Card className={cn(
      "w-full max-w-2xl shadow-xl transition-all duration-300",
      gamePhase === "playing" ? "bg-card/80" : "bg-card"
    )}>
      <CardHeader className="space-y-1 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Snake Game</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="mute-toggle"
                checked={!isMuted}
                onCheckedChange={toggleMute}
              />
              <Label htmlFor="mute-toggle" className="flex items-center">
                {isMuted ? (
                  <VolumeX className="h-4 w-4 mr-1 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-4 w-4 mr-1 text-primary" />
                )}
                Sound
              </Label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <div className="text-2xl font-bold text-primary">
            Score: {score}
          </div>
          
          {/* Only show difficulty selector when not playing */}
          {gamePhase !== "playing" && (
            <div className="flex items-center">
              <Gauge className="h-4 w-4 mr-2 text-muted-foreground" />
              <Select 
                value={difficulty} 
                onValueChange={(value) => setDifficulty(value as "easy" | "medium" | "hard")}
              >
                <SelectTrigger className="w-[110px] h-8">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
