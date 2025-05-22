import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
}

export default function GameOverScreen({ score, onRestart }: GameOverScreenProps) {
  // Function to get a message based on the score
  const getScoreMessage = (score: number): string => {
    if (score === 0) return "Better luck next time!";
    if (score < 5) return "Good try!";
    if (score < 10) return "Well done!";
    if (score < 20) return "Impressive!";
    if (score < 30) return "Amazing!";
    return "You're a Snake Master!";
  };

  return (
    <Card className="bg-card/80 border-destructive">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-center">Game Over</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-6">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h3 className="text-3xl font-bold mb-2">Score: {score}</h3>
        <p className="text-xl text-muted-foreground">{getScoreMessage(score)}</p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onRestart} 
          className="w-full text-lg py-6"
          size="lg"
        >
          Play Again
        </Button>
      </CardFooter>
    </Card>
  );
}
