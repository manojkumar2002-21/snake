import { create } from "zustand";

// Define types
type Direction = "up" | "down" | "left" | "right";
type GamePhase = "ready" | "playing" | "ended";
type UpdateResult = "move" | "eat" | "collision";
type DifficultyLevel = "easy" | "medium" | "hard";

interface Position {
  x: number;
  y: number;
}

interface BoardSize {
  width: number;
  height: number;
}

interface Snake {
  body: Position[];
  boardSize: BoardSize;
}

interface SnakeGameState {
  // Game state
  gamePhase: GamePhase;
  score: number;
  difficulty: DifficultyLevel;
  direction: Direction;
  snake: Snake;
  food: Position;
  
  // Actions
  startGame: () => void;
  restartGame: () => void;
  endGame: () => void;
  setDirection: (direction: Direction) => void;
  setDifficulty: (level: DifficultyLevel) => void;
  updateGame: () => UpdateResult;
  
  // Game info
  getGameSpeed: () => number;
}

// Constants for the game
const INITIAL_SNAKE_LENGTH = 3;
const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 15;

// Helper function to generate random position for food
const generateFoodPosition = (snake: Position[]): Position => {
  // Keep generating until we find a position that's not on the snake
  while (true) {
    const position = {
      x: Math.floor(Math.random() * BOARD_WIDTH),
      y: Math.floor(Math.random() * BOARD_HEIGHT)
    };
    
    // Check if this position is on the snake
    const onSnake = snake.some(segment => 
      segment.x === position.x && segment.y === position.y
    );
    
    if (!onSnake) {
      return position;
    }
  }
};

// Create initial snake body
const createInitialSnake = (): Snake => {
  // Snake starts in the middle of the board, moving right
  const centerX = Math.floor(BOARD_WIDTH / 2);
  const centerY = Math.floor(BOARD_HEIGHT / 2);
  
  const body: Position[] = [];
  
  // Add segments from head to tail (left to right)
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    body.push({ x: centerX - i, y: centerY });
  }
  
  return {
    body,
    boardSize: { width: BOARD_WIDTH, height: BOARD_HEIGHT }
  };
};

// Create the store
export const useSnakeGame = create<SnakeGameState>((set, get) => {
  // Generate initial snake
  const initialSnake = createInitialSnake();
  
  return {
    // Initial state
    gamePhase: "ready",
    score: 0,
    difficulty: "medium", // Default difficulty
    direction: "right",
    snake: initialSnake,
    food: generateFoodPosition(initialSnake.body),
    
    // Actions
    startGame: () => {
      set({ gamePhase: "playing" });
    },
    
    restartGame: () => {
      const snake = createInitialSnake();
      set({
        gamePhase: "ready",
        score: 0,
        direction: "right",
        snake,
        food: generateFoodPosition(snake.body),
      });
    },
    
    endGame: () => {
      set({ gamePhase: "ended" });
    },
    
    setDirection: (direction) => {
      set({ direction });
    },
    
    setDifficulty: (difficulty) => {
      set({ difficulty });
    },
    
    // Get game speed based on difficulty level
    getGameSpeed: () => {
      const { difficulty } = get();
      switch (difficulty) {
        case "easy":
          return 250; // Slower
        case "medium":
          return 175; // Medium speed
        case "hard":
          return 100; // Faster
        default:
          return 175;
      }
    },
    
    updateGame: () => {
      // Get current state
      const { snake, direction, food } = get();
      
      // Create a new head position based on current direction
      const head = { ...snake.body[0] };
      
      switch (direction) {
        case "up":
          head.y -= 1;
          break;
        case "down":
          head.y += 1;
          break;
        case "left":
          head.x -= 1;
          break;
        case "right":
          head.x += 1;
          break;
      }
      
      // Check if the snake hit the wall
      if (
        head.x < 0 || 
        head.x >= snake.boardSize.width || 
        head.y < 0 || 
        head.y >= snake.boardSize.height
      ) {
        return "collision";
      }
      
      // Check if the snake hit itself
      for (let i = 0; i < snake.body.length; i++) {
        if (snake.body[i].x === head.x && snake.body[i].y === head.y) {
          return "collision";
        }
      }
      
      // Create a new body array with the new head at the front
      const newBody = [head, ...snake.body];
      
      // Check if the snake ate the food
      const ateFood = head.x === food.x && head.y === food.y;
      
      if (ateFood) {
        // Generate new food position
        const newFood = generateFoodPosition(newBody);
        
        // Update state with new snake (keep the tail) and new food
        set(state => ({
          snake: { ...state.snake, body: newBody },
          food: newFood,
          score: state.score + 1
        }));
        
        return "eat";
      } else {
        // If no food was eaten, remove the tail
        newBody.pop();
        
        // Update state with new snake (without the tail)
        set(state => ({
          snake: { ...state.snake, body: newBody }
        }));
        
        return "move";
      }
    }
  };
});
