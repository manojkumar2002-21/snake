import { Suspense } from "react";
import SnakeGame from "./components/game/SnakeGame";
import "@fontsource/inter";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Suspense fallback={<div>Loading game...</div>}>
        <SnakeGame />
      </Suspense>
      <Toaster />
    </div>
  );
}

export default App;
