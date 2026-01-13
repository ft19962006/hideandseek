// 交通捉伊人 - Game Manager (Maze Survival Mode)

import { GameState, MazeGameState } from '@/types';
import { SURVIVAL_CONFIG } from '@/config/gameConfig';
import { GameLoop } from './GameLoop';
import { InputHandler } from '@/input/InputHandler';
import { StaminaSystem } from '@/systems/StaminaSystem';
import { MoneySystem } from '@/systems/MoneySystem';
import { PlayerSystem } from '@/systems/PlayerSystem';
import { MapSystem } from '@/systems/MapSystem';
import { TransportSystem } from '@/systems/TransportSystem';
import { EnemySystem } from '@/systems/EnemySystem';
import { Renderer } from '@/rendering/Renderer';

export class GameManager {
  private canvas: HTMLCanvasElement;
  private gameLoop: GameLoop;
  private inputHandler: InputHandler;
  private staminaSystem: StaminaSystem;
  private moneySystem: MoneySystem;
  private playerSystem: PlayerSystem;
  private mapSystem: MapSystem;
  private transportSystem: TransportSystem;
  private enemySystem: EnemySystem;
  private renderer: Renderer;
  
  private isPaused: boolean = false;
  private isInitialized: boolean = false;
  
  // Maze survival game state
  private mazeGameState: MazeGameState = {
    status: 'playing',
    survivalTime: 0,
    targetTime: SURVIVAL_CONFIG.TARGET_TIME,
    enemies: []
  };
  
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    
    // Create systems
    this.gameLoop = new GameLoop();
    this.inputHandler = new InputHandler();
    this.staminaSystem = new StaminaSystem();
    this.moneySystem = new MoneySystem();
    this.mapSystem = new MapSystem();
    
    // Player system needs other systems
    this.playerSystem = new PlayerSystem(
      this.staminaSystem,
      this.moneySystem,
      this.inputHandler
    );
    
    // Transport system needs map system
    this.transportSystem = new TransportSystem(this.mapSystem);
    
    // Enemy system for maze survival mode
    this.enemySystem = new EnemySystem();
    
    // Renderer needs all systems
    this.renderer = new Renderer(
      canvas,
      this.mapSystem,
      this.playerSystem,
      this.transportSystem,
      this.staminaSystem,
      this.moneySystem
    );
  }
  
  /**
   * Initialize all game systems
   */
  init(): void {
    if (this.isInitialized) {
      console.warn('[GameManager] Already initialized');
      return;
    }
    
    console.log('[GameManager] Initializing...');
    
    // Initialize all systems
    this.inputHandler.init();
    this.mapSystem.init();
    this.staminaSystem.init();
    this.moneySystem.init();
    
    // Connect map system to player system for wall collision detection
    this.playerSystem.setMapSystem(this.mapSystem);
    
    // Initialize player at spawn position
    const spawnPos = this.mapSystem.getPlayerSpawnPosition();
    this.playerSystem.init(spawnPos);
    
    // Initialize enemy system for maze survival
    this.enemySystem.setMapSystem(this.mapSystem);
    this.enemySystem.spawnEnemies(spawnPos);
    
    this.transportSystem.init();
    
    // Connect renderer to enemy system and game state
    this.renderer.setEnemySystem(this.enemySystem);
    this.renderer.setMazeGameState(this.mazeGameState);
    
    // Set up transport event handlers (Disabled for Maze Mode)
    // this.transportSystem.onEvent((event) => { ... });
    
    // Register game loop callbacks
    this.gameLoop.onUpdate((deltaTime) => this.update(deltaTime));
    this.gameLoop.onRender(() => this.render());
    
    this.isInitialized = true;
    console.log('[GameManager] Initialization complete');
  }
  
  /**
   * Start the game
   */
  start(): void {
    if (!this.isInitialized) {
      this.init();
    }
    
    this.gameLoop.start();
    console.log('[GameManager] Game started');
    
    // Hide loading indicator
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }
  
  /**
   * Stop the game
   */
  stop(): void {
    this.gameLoop.stop();
    console.log('[GameManager] Game stopped');
  }
  
  /**
   * Pause/unpause the game
   */
  togglePause(): void {
    this.isPaused = !this.isPaused;
    console.log('[GameManager] Game', this.isPaused ? 'paused' : 'resumed');
  }
  
  /**
   * Main update function
   */
  private update(deltaTime: number): void {
    // Handle pause toggle (only when playing)
    if (this.inputHandler.isJustPressed('pause') && this.mazeGameState.status === 'playing') {
      this.togglePause();
    }
    
    // Handle restart when game is over (won or lost)
    if (this.mazeGameState.status !== 'playing') {
      if (this.inputHandler.isJustPressed('restart') || this.inputHandler.isJustPressed('interact')) {
        this.restartGame();
      }
      this.inputHandler.clearJustPressed();
      return;
    }
    
    if (this.isPaused) {
      this.inputHandler.clearJustPressed();
      return;
    }
    
    // Update survival timer
    this.mazeGameState.survivalTime += deltaTime;
    
    // Check win condition - survived target time
    if (this.mazeGameState.survivalTime >= this.mazeGameState.targetTime) {
      this.mazeGameState.status = 'won';
      console.log('[GameManager] Player won! Survived', this.mazeGameState.targetTime, 'seconds');
      this.inputHandler.clearJustPressed();
      return;
    }
    
    // Update player
    this.playerSystem.update(deltaTime);
    
    // Update enemies
    const playerPos = this.playerSystem.getPosition();
    this.enemySystem.update(deltaTime, playerPos);
    
    // Update enemies array reference in mazeGameState
    this.mazeGameState.enemies = this.enemySystem.getEnemies();
    
    // Check lose condition - enemy touched player
    const playerRadius = 12; // Must match renderer size
    if (this.enemySystem.checkPlayerCollision(playerPos, playerRadius)) {
      this.mazeGameState.status = 'lost';
      console.log('[GameManager] Player lost! Caught by enemy at', this.mazeGameState.survivalTime.toFixed(1), 'seconds');
      this.inputHandler.clearJustPressed();
      return;
    }
    
    // Clear just pressed states at end of frame
    this.inputHandler.clearJustPressed();
  }
  
  // Legacy transport methods removed - Maze Mode only
  
  /**
   * Main render function
   */
  private render(): void {
    // Before rendering, ensure renderer has current state
    this.renderer.setMazeGameState(this.mazeGameState);
    
    // Renderer handles all rendering including overlays
    this.renderer.render();
  }
  
  /**
   * Get current game state
   */
  getGameState(): GameState {
    return {
      player: this.playerSystem.getPlayer(),
      map: this.mapSystem.getMapData(),
      transports: this.transportSystem.getVehicles(),
      gameTime: 0, // TODO: implement game timer
      isPaused: this.isPaused,
      isLoading: !this.isInitialized,
    };
  }
  
  /**
   * Get maze game state (survival mode)
   */
  getMazeGameState(): MazeGameState {
    return this.mazeGameState;
  }
  
  /**
   * Get enemy system
   */
  getEnemySystem(): EnemySystem {
    return this.enemySystem;
  }
  
  /**
   * Restart the game (for maze survival mode)
   */
  restartGame(): void {
    console.log('[GameManager] Restarting game...');
    
    // Reset maze game state
    this.mazeGameState = {
      status: 'playing',
      survivalTime: 0,
      targetTime: SURVIVAL_CONFIG.TARGET_TIME,
      enemies: []
    };
    
    // Regenerate maze
    this.mapSystem = new MapSystem();
    this.mapSystem.init();
    
    // Reset enemy system with new map
    this.enemySystem.reset();
    this.enemySystem.setMapSystem(this.mapSystem);
    
    // Reset player at new spawn position
    const playerSpawn = this.mapSystem.getPlayerSpawnPosition();
    this.playerSystem.init(playerSpawn);
    this.playerSystem.setMapSystem(this.mapSystem);
    
    // Spawn enemies away from player
    this.enemySystem.spawnEnemies(playerSpawn);
    
    // Re-connect renderer after restart
    this.renderer.setMapSystem(this.mapSystem);
    this.renderer.setEnemySystem(this.enemySystem);
    this.renderer.setMazeGameState(this.mazeGameState);
    
    // Reset pause state
    this.isPaused = false;
    
    console.log('[GameManager] Game restarted');
  }
  
  /**
   * Clean up resources
   */
  destroy(): void {
    this.gameLoop.stop();
    this.inputHandler.destroy();
    console.log('[GameManager] Destroyed');
  }
}
