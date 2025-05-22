import React, { useEffect, useRef } from 'react';
import { createPhaserGame } from '@/phaser';
import { useGame } from '@/lib/stores/useGame';
import { useAudio } from '@/lib/stores/useAudio';

export default function PhaserGame() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const { phase, restart } = useGame();
  const { 
    setBackgroundMusic, 
    setHitSound, 
    setSuccessSound, 
    setMoveSound, 
    startBackgroundMusic 
  } = useAudio();

  // Initialize audio and Phaser game on mount
  useEffect(() => {
    // Set up audio
    const bgMusic = new Audio('/sounds/background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.2;
    setBackgroundMusic(bgMusic);

    const hitSfx = new Audio('/sounds/hit.mp3');
    setHitSound(hitSfx);

    const successSfx = new Audio('/sounds/success.mp3');
    setSuccessSound(successSfx);

    const moveSfx = new Audio('/sounds/move.mp3');
    moveSfx.volume = 0.1;
    setMoveSound(moveSfx);

    // Initialize Phaser
    if (gameContainerRef.current && !gameInstanceRef.current) {
      const game = createPhaserGame(gameContainerRef.current);
      gameInstanceRef.current = game;
    }

    // Start background music when game starts
    if (phase === 'playing') {
      startBackgroundMusic();
    }

    // Cleanup on unmount
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [
    setBackgroundMusic, 
    setHitSound, 
    setSuccessSound, 
    setMoveSound, 
    startBackgroundMusic, 
    phase
  ]);

  return (
    <div className="w-full max-w-screen-md mx-auto">
      <div 
        ref={gameContainerRef} 
        className="phaser-container relative w-full aspect-square rounded-md overflow-hidden border border-border shadow-md"
      />
      
      {phase === 'ended' && (
        <div className="mt-4 flex justify-center">
          <button 
            onClick={restart}
            className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md shadow-sm hover:bg-primary/90 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}