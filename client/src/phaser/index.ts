import Phaser from 'phaser';
import GameScene from './scenes/GameScene';

export function createPhaserGame(parentElement: HTMLElement): Phaser.Game {
  // Game configuration
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 500, // 25 grid cells * 20px
    height: 500, // 25 grid cells * 20px
    parent: parentElement,
    scene: [GameScene],
    backgroundColor: '#0a1f0a',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }
  };

  // Create and return the game instance
  return new Phaser.Game(config);
}