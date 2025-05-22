import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Medal } from "lucide-react";
import { motion } from "framer-motion";

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

  // Function to determine how many stars to show based on score
  const getStars = (score: number): number => {
    if (score < 5) return 1;
    if (score < 15) return 2;
    if (score < 25) return 3;
    if (score < 40) return 4;
    return 5;
  };

  const stars = getStars(score);

  return (
    <Card className="bg-card/80 border-destructive overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-center">Game Over</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6 relative">
          {/* Animated particles for high scores */}
          {score > 10 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(Math.min(score, 30))].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary/20 rounded-full"
                  initial={{ 
                    x: Math.random() * 100 - 50 + 50 + "%", 
                    y: "100%",
                    opacity: 0 
                  }}
                  animate={{ 
                    y: -20 - Math.random() * 80 + "%", 
                    opacity: [0, 1, 0],
                    x: (Math.random() * 100 - 50 + 50) + "%"
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          )}
          
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {score >= 20 ? (
              <Medal className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            ) : (
              <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
            )}
          </motion.div>
          
          <motion.h3 
            className="text-3xl font-bold mb-3"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Score: {score}
          </motion.h3>
          
          <motion.div 
            className="flex justify-center mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-6 h-6 mx-1 ${i < stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
              />
            ))}
          </motion.div>
          
          <motion.p 
            className="text-xl text-muted-foreground"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            {getScoreMessage(score)}
          </motion.p>
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
      </motion.div>
    </Card>
  );
}
