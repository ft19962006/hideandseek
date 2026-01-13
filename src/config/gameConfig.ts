// 交通捉伊人 - Game Configuration

import { GameConfig } from '@/types';

export const gameConfig: GameConfig = {
  canvas: {
    width: 800,
    height: 600,
  },
  
  player: {
    startPosition: { x: 10, y: 10 }, // Grid position (center of 20x20 map)
    walkSpeed: 100, // pixels per second
    runSpeed: 200,  // pixels per second
    initialMoney: 100,
    initialStamina: 100,
    maxStamina: 100,
  },
  
  stamina: {
    walkCostPerSecond: 1,
    runCostPerSecond: 3,
    idleRecoveryPerSecond: 2,
    transportRecoveryPerSecond: 1,
    exhaustedSpeedMultiplier: 0.5, // 50% speed when exhausted
  },
  
  transport: {
    bus: {
      speed: 200,   // 2x walk speed
      cost: 10,
      waitTime: 3,  // seconds at each stop
    },
    metro: {
      speed: 300,   // 3x walk speed
      cost: 20,
      waitTime: 5,  // seconds at each stop
    },
    taxi: {
      speed: 250,   // 2.5x walk speed
      cost: 30,
      waitTime: 0,  // instant pickup
    },
  },
  
  map: {
    width: 20,      // 20 tiles wide
    height: 20,     // 20 tiles tall
    tileSize: 32,   // 32x32 pixels per tile
  },
};

// Transport colors for rendering
export const transportColors = {
  bus: '#4CAF50',    // Green
  metro: '#2196F3',  // Blue
  taxi: '#FFC107',   // Yellow
};

// Player colors
export const playerColors = {
  fill: '#E91E63',   // Pink
  stroke: '#880E4F', // Dark pink
};

// Map colors
export const mapColors = {
  road: '#424242',
  building: '#757575',
  grass: '#81C784',
  stop: '#FFF176',
  grid: '#333333',
  wall: '#000000',
};

export const MAZE_CONFIG = {
  WIDTH: 21,           // Must be odd for maze algorithm
  HEIGHT: 21,          // Must be odd for maze algorithm
  TILE_SIZE: 32,
};

export const SURVIVAL_CONFIG = {
  TARGET_TIME: 30,     // 30 seconds to survive
  START_DELAY: 1,      // 1 second grace period at start
};

export const ENEMY_CONFIG = {
  SPEED: 80,           // Slower than player (player is 120)
  COUNT: 2,            // Number of enemies
  PATH_UPDATE_INTERVAL: 0.5,  // Update path every 0.5 seconds
  MIN_SPAWN_DISTANCE: 8,      // Minimum tiles away from player spawn
};
