// 交通捉伊人 - Main Entry Point
// Transport Hide and Seek - A lightweight web game

console.log('%c[MAIN.TS] Module loading started', 'color: green; font-weight: bold');

import { GameManager } from '@/game/GameManager';
import { gameConfig } from '@/config/gameConfig';

console.log('%c[MAIN.TS] Imports successful', 'color: green');

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('=================================');
  console.log('  交通捉伊人 - Transport Hide & Seek');
  console.log('  Version: 0.1.0 (Sandbox Mode)');
  console.log('=================================');
  
  // Get canvas element
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Failed to find game canvas element');
    return;
  }
  
  // Set canvas size
  canvas.width = gameConfig.canvas.width;
  canvas.height = gameConfig.canvas.height;
  
  // Update container size to match
  const container = document.getElementById('game-container');
  if (container) {
    container.style.width = `${gameConfig.canvas.width}px`;
    container.style.height = `${gameConfig.canvas.height}px`;
  }
  
  // Create and start game
  const game = new GameManager(canvas);
  
  // Initialize and start
  game.init();
  game.start();
  
  // Expose game instance for debugging
  (window as unknown as { game: GameManager }).game = game;
  
  console.log('Game initialized. Use window.game to access game instance.');
  console.log('Controls:');
  console.log('  WASD / Arrow Keys - Move');
  console.log('  Shift - Run');
  console.log('  E - Interact (board/exit transport)');
  console.log('  ESC - Pause');
});
