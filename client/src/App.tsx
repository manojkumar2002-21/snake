import { Suspense, useState } from "react";
import SnakeGame from "./components/game/SnakeGame";
import SnakeGamePhaser from "./components/game/SnakeGamePhaser";
import "@fontsource/inter";
import { Toaster } from "sonner";

function App() {
  const [usePhaserGraphics, setUsePhaserGraphics] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <header className="w-full max-w-3xl mx-auto mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Snake Game</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="graphics-toggle" className="text-sm font-medium mr-2">
            Enhanced Graphics:
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="graphics-toggle"
              type="checkbox"
              className="sr-only peer"
              checked={usePhaserGraphics}
              onChange={() => setUsePhaserGraphics(!usePhaserGraphics)}
            />
            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </header>
      
      <Suspense fallback={<div>Loading game...</div>}>
        {usePhaserGraphics ? <SnakeGamePhaser /> : <SnakeGame />}
      </Suspense>
      
      <footer className="mt-8 text-center text-muted-foreground text-sm">
        <p>Toggle between classic and enhanced graphics with the switch above</p>
      </footer>
      
      <Toaster />
    </div>
  );
}

export default App;
