import { Suspense, useState } from "react";
import SnakeGame from "./components/game/SnakeGame";
import SnakeGamePhaser from "./components/game/SnakeGamePhaser";
import Snake3DWithModels from "./components/game/Snake3DWithModels";
import "@fontsource/inter";
import { Toaster } from "sonner";

function App() {
  const [graphicsMode, setGraphicsMode] = useState<'classic' | '2d' | '3d'>('classic');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <header className="w-full max-w-3xl mx-auto mb-6 flex flex-col md:flex-row md:justify-between items-center gap-3">
        <h1 className="text-3xl font-bold text-primary">Snake Game</h1>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <label htmlFor="graphics-mode" className="text-sm font-medium">
            Graphics Mode:
          </label>
          <div className="flex rounded-md overflow-hidden border border-border">
            <button
              className={`px-3 py-2 text-sm ${graphicsMode === 'classic' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
              onClick={() => setGraphicsMode('classic')}
            >
              Classic
            </button>
            <button
              className={`px-3 py-2 text-sm ${graphicsMode === '2d' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
              onClick={() => setGraphicsMode('2d')}
            >
              Enhanced 2D
            </button>
            <button
              className={`px-3 py-2 text-sm ${graphicsMode === '3d' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
              onClick={() => setGraphicsMode('3d')}
            >
              Full 3D
            </button>
          </div>
        </div>
      </header>
      
      <Suspense fallback={
        <div className="flex items-center justify-center h-96 w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Loading game assets...</p>
          </div>
        </div>
      }>
        {graphicsMode === 'classic' && <SnakeGame />}
        {graphicsMode === '2d' && <SnakeGamePhaser />}
        {graphicsMode === '3d' && <Snake3DWithModels />}
      </Suspense>
      
      <footer className="mt-8 text-center text-muted-foreground text-sm">
        <div className="max-w-lg mx-auto">
          <p>Switch between Classic, Enhanced 2D, and Full 3D modes using the buttons above.</p>
          <p className="mt-2">The 3D mode uses real 3D models and allows you to rotate and zoom the camera!</p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
}

export default App;
