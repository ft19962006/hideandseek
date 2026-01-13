// 交通捉伊人 - Player System

import { Position, PlayerState, Direction, Player } from '@/types';
import { gameConfig, MAZE_CONFIG } from '@/config/gameConfig';
import { StaminaSystem } from './StaminaSystem';
import { MoneySystem } from './MoneySystem';
import { InputHandler } from '@/input/InputHandler';
import { MapSystem } from './MapSystem';

export class PlayerSystem {
  private player: Player;
  private staminaSystem: StaminaSystem;
  private moneySystem: MoneySystem;
  private inputHandler: InputHandler;
  private mapSystem: MapSystem | null = null;
  
  constructor(
    staminaSystem: StaminaSystem,
    moneySystem: MoneySystem,
    inputHandler: InputHandler
  ) {
    this.staminaSystem = staminaSystem;
    this.moneySystem = moneySystem;
    this.inputHandler = inputHandler;
    
    // Initialize player with default values
    const config = gameConfig.player;
    
    this.player = {
      id: 'player-1',
      position: { x: 0, y: 0 }, // Will be set in init
      velocity: { x: 0, y: 0 },
      state: 'idle',
      direction: 'down',
      stamina: config.initialStamina,
      maxStamina: config.maxStamina,
      money: config.initialMoney,
      currentTransport: null,
      movementSpeed: config.walkSpeed,
    };
  }
  
  /**
   * Set the map system for wall collision detection
   */
  setMapSystem(mapSystem: MapSystem): void {
    this.mapSystem = mapSystem;
  }
  
  /**
   * Initialize the player system
   */
  init(startPosition?: Position): void {
    if (startPosition) {
      this.player.position = { ...startPosition };
    }
    
    this.player.state = 'idle';
    this.player.velocity = { x: 0, y: 0 };
    this.player.currentTransport = null;
    
    console.log('[PlayerSystem] Initialized at position:', this.player.position);
  }
  
  /**
   * Update player state
   * @param deltaTime Time since last update in seconds
   */
  update(deltaTime: number): void {
    // Don't update if on transport
    if (this.player.state === 'onTransport' || this.player.state === 'boarding') {
      return;
    }
    
    // Get input
    const movement = this.inputHandler.getMovementVector();
    const isRunning = this.inputHandler.isPressed('run');
    const isMoving = this.inputHandler.isMoving();
    
    // Determine player state
    if (isMoving) {
      // Check if can run (need stamina and not exhausted)
      const canRun = isRunning && !this.staminaSystem.getIsExhausted();
      this.player.state = canRun ? 'running' : 'walking';
      
      // Calculate speed
      const baseSpeed = canRun ? gameConfig.player.runSpeed : gameConfig.player.walkSpeed;
      const speed = baseSpeed * this.staminaSystem.getSpeedMultiplier();
      
      // Update velocity
      this.player.velocity.x = movement.x * speed;
      this.player.velocity.y = movement.y * speed;
      
      // Update direction
      this.updateDirection(movement);
    } else {
      this.player.state = 'idle';
      this.player.velocity.x = 0;
      this.player.velocity.y = 0;
    }
    
    // Update stamina based on state
    this.staminaSystem.update(deltaTime, this.player.state);
    
    // Update position
    this.updatePosition(deltaTime);
    
    // Sync stamina/money to player object for reference
    this.player.stamina = this.staminaSystem.getCurrentStamina();
    this.player.money = this.moneySystem.getBalance();
  }
  
  /**
   * Update player direction based on movement
   */
  private updateDirection(movement: { x: number; y: number }): void {
    // Prefer horizontal direction for diagonal movement
    if (Math.abs(movement.x) > Math.abs(movement.y)) {
      this.player.direction = movement.x > 0 ? 'right' : 'left';
    } else if (movement.y !== 0) {
      this.player.direction = movement.y > 0 ? 'down' : 'up';
    }
  }
  
  /**
   * Update player position with boundary and wall collision checking
   */
  private updatePosition(deltaTime: number): void {
    const tileSize = MAZE_CONFIG.TILE_SIZE;
    const mapWidth = MAZE_CONFIG.WIDTH * tileSize;
    const mapHeight = MAZE_CONFIG.HEIGHT * tileSize;
    const playerRadius = 10; // Half of player hitbox size
    
    const currentX = this.player.position.x;
    const currentY = this.player.position.y;
    
    // Calculate proposed new positions separately for X and Y
    let newX = currentX + this.player.velocity.x * deltaTime;
    let newY = currentY + this.player.velocity.y * deltaTime;
    
    // Clamp to map boundaries first
    newX = Math.max(playerRadius, Math.min(mapWidth - playerRadius, newX));
    newY = Math.max(playerRadius, Math.min(mapHeight - playerRadius, newY));
    
    // If no map system, just apply boundary-clamped movement
    if (!this.mapSystem) {
      this.player.position.x = newX;
      this.player.position.y = newY;
      return;
    }
    
    // Try moving in X direction only
    if (this.canMoveTo(newX, currentY, playerRadius, tileSize)) {
      this.player.position.x = newX;
    }
    
    // Try moving in Y direction only
    if (this.canMoveTo(this.player.position.x, newY, playerRadius, tileSize)) {
      this.player.position.y = newY;
    }
  }
  
  /**
   * Check if the player can move to a position without colliding with walls
   * Uses corner-based hitbox collision detection
   */
  private canMoveTo(x: number, y: number, playerRadius: number, tileSize: number): boolean {
    if (!this.mapSystem) {
      return true;
    }
    
    // Check all four corners of player hitbox
    const corners = [
      { x: x - playerRadius, y: y - playerRadius }, // top-left
      { x: x + playerRadius, y: y - playerRadius }, // top-right
      { x: x - playerRadius, y: y + playerRadius }, // bottom-left
      { x: x + playerRadius, y: y + playerRadius }, // bottom-right
    ];
    
    // Check if any corner is in a wall
    for (const corner of corners) {
      const tileX = Math.floor(corner.x / tileSize);
      const tileY = Math.floor(corner.y / tileSize);
      if (!this.mapSystem.isWalkable(tileX, tileY)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Board a transport vehicle
   */
  boardTransport(transportId: string): boolean {
    if (this.player.currentTransport !== null) {
      console.log('[PlayerSystem] Already on transport');
      return false;
    }
    
    this.player.currentTransport = transportId;
    this.player.state = 'boarding';
    this.player.velocity = { x: 0, y: 0 };
    
    // After boarding animation, switch to onTransport
    setTimeout(() => {
      if (this.player.currentTransport === transportId) {
        this.player.state = 'onTransport';
      }
    }, 500);
    
    console.log('[PlayerSystem] Boarding transport:', transportId);
    return true;
  }
  
  /**
   * Exit current transport
   */
  exitTransport(exitPosition: Position): void {
    if (this.player.currentTransport === null) {
      console.log('[PlayerSystem] Not on any transport');
      return;
    }
    
    this.player.currentTransport = null;
    this.player.position = { ...exitPosition };
    this.player.state = 'idle';
    
    console.log('[PlayerSystem] Exited transport at:', exitPosition);
  }
  
  /**
   * Set player position (used when on transport)
   */
  setPosition(position: Position): void {
    this.player.position = { ...position };
  }
  
  /**
   * Get player position
   */
  getPosition(): Position {
    return { ...this.player.position };
  }
  
  /**
   * Get player grid position
   */
  getGridPosition(): Position {
    const tileSize = this.mapSystem?.getMapData().tileSize ?? MAZE_CONFIG.TILE_SIZE;
    return {
      x: Math.floor(this.player.position.x / tileSize),
      y: Math.floor(this.player.position.y / tileSize),
    };
  }
  
  /**
   * Get player state
   */
  getState(): PlayerState {
    return this.player.state;
  }
  
  /**
   * Get player direction
   */
  getDirection(): Direction {
    return this.player.direction;
  }
  
  /**
   * Get full player object
   */
  getPlayer(): Player {
    return { ...this.player };
  }
  
  /**
   * Check if player is on transport
   */
  isOnTransport(): boolean {
    return this.player.currentTransport !== null;
  }
  
  /**
   * Get current transport ID
   */
  getCurrentTransportId(): string | null {
    return this.player.currentTransport;
  }
}
