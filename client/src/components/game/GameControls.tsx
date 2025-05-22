import { useSnakeGame } from "@/lib/stores/useSnakeGame";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export default function GameControls() {
  const { 
    gamePhase,
    direction,
    setDirection
  } = useSnakeGame();

  // Only show controls when the game is playing
  if (gamePhase !== "playing") {
    return (
      <div className="text-sm text-muted-foreground text-center">
        <p className="mb-1">How to play:</p>
        <p>Use arrow keys or WASD to control the snake.</p>
        <p>Collect food to grow and increase your score.</p>
        <p>Don't hit the walls or yourself!</p>
      </div>
    );
  }

  const handleDirectionClick = (newDirection: string) => {
    // Apply same rules as keyboard controls
    switch (newDirection) {
      case "up":
        if (direction !== "down") setDirection("up");
        break;
      case "down":
        if (direction !== "up") setDirection("down");
        break;
      case "left":
        if (direction !== "right") setDirection("left");
        break;
      case "right":
        if (direction !== "left") setDirection("right");
        break;
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
        {/* Top row - Up button */}
        <div className="col-start-2">
          <Button
            variant={direction === "up" ? "default" : "outline"}
            size="icon"
            className="w-14 h-14"
            onClick={() => handleDirectionClick("up")}
          >
            <ChevronUp className="h-8 w-8" />
          </Button>
        </div>
        
        {/* Middle row - Left, Right buttons */}
        <div>
          <Button
            variant={direction === "left" ? "default" : "outline"}
            size="icon"
            className="w-14 h-14"
            onClick={() => handleDirectionClick("left")}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        </div>
        <div className="col-start-3">
          <Button
            variant={direction === "right" ? "default" : "outline"}
            size="icon"
            className="w-14 h-14"
            onClick={() => handleDirectionClick("right")}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
        
        {/* Bottom row - Down button */}
        <div className="col-start-2">
          <Button
            variant={direction === "down" ? "default" : "outline"}
            size="icon"
            className="w-14 h-14"
            onClick={() => handleDirectionClick("down")}
          >
            <ChevronDown className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
}
