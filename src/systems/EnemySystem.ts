// 交通捉伊人 - Enemy System
// Implements enemy AI with chasing behavior for maze survival mode

import { Enemy, Position } from '@/types';
import { ENEMY_CONFIG, MAZE_CONFIG } from '@/config/gameConfig';
import { MapSystem } from './MapSystem';

export class EnemySystem {
  private enemies: Enemy[] = [];
  private mapSystem: MapSystem | null = null;
  
  /**
   * Set the map system reference for wall collision detection
   */
  setMapSystem(mapSystem: MapSystem): void {
    this.mapSystem = mapSystem;
  }
  
  /**
   * Spawn enemies at valid positions away from the player
   */
  spawnEnemies(playerSpawn: Position): void {
    this.enemies = [];
    
    if (!this.mapSystem) {
      console.error('[EnemySystem] MapSystem not set, cannot spawn enemies');
      return;
    }
    
    for (let i = 0; i < ENEMY_CONFIG.COUNT; i++) {
      const spawnPos = this.findValidSpawnPosition(playerSpawn);
      
      if (spawnPos) {
        const enemy: Enemy = {
          x: spawnPos.x,
          y: spawnPos.y,
          velocityX: 0,
          velocityY: 0,
          speed: ENEMY_CONFIG.SPEED,
          targetX: spawnPos.x,
          targetY: spawnPos.y,
          pathUpdateTimer: 0,
        };
        this.enemies.push(enemy);
        console.log(`[EnemySystem] Spawned enemy ${i + 1} at (${spawnPos.x.toFixed(0)}, ${spawnPos.y.toFixed(0)})`);
      } else {
        console.warn(`[EnemySystem] Could not find valid spawn position for enemy ${i + 1}`);
      }
    }
    
    console.log(`[EnemySystem] Spawned ${this.enemies.length} enemies`);
  }
  
  /**
   * Find a valid spawn position for an enemy
   * Must be on a 'road' tile and at least MIN_SPAWN_DISTANCE tiles away from player
   */
  private findValidSpawnPosition(playerSpawn: Position): Position | null {
    if (!this.mapSystem) {
      return null;
    }
    
    const mapData = this.mapSystem.getMapData();
    const tileSize = MAZE_CONFIG.TILE_SIZE;
    const minDistanceTiles = ENEMY_CONFIG.MIN_SPAWN_DISTANCE;
    const minDistancePixels = minDistanceTiles * tileSize;
    
    // Convert player spawn to grid position
    const playerGridX = Math.floor(playerSpawn.x / tileSize);
    const playerGridY = Math.floor(playerSpawn.y / tileSize);
    
    // Collect all valid spawn positions
    const validPositions: Position[] = [];
    
    for (let y = 0; y < mapData.height; y++) {
      for (let x = 0; x < mapData.width; x++) {
        const tile = mapData.tiles[y][x];
        
        // Must be a road tile (walkable)
        if (tile.type !== 'road' || !tile.walkable) {
          continue;
        }
        
        // Calculate tile distance from player spawn (Manhattan distance in tiles)
        const tileDistX = Math.abs(x - playerGridX);
        const tileDistY = Math.abs(y - playerGridY);
        const tileDistance = Math.sqrt(tileDistX * tileDistX + tileDistY * tileDistY);
        
        // Must be at least MIN_SPAWN_DISTANCE tiles away
        if (tileDistance >= minDistanceTiles) {
          // Convert to world position (center of tile)
          validPositions.push({
            x: x * tileSize + tileSize / 2,
            y: y * tileSize + tileSize / 2,
          });
        }
      }
    }
    
    // Randomly pick from valid positions
    if (validPositions.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * validPositions.length);
    return validPositions[randomIndex];
  }
  
  /**
   * Update all enemies - chase the player
   */
  update(deltaTime: number, playerPos: Position): void {
    for (const enemy of this.enemies) {
      this.updateEnemy(enemy, playerPos, deltaTime);
    }
  }
  
  /**
   * Update a single enemy's position using chase AI
   */
  private updateEnemy(enemy: Enemy, playerPos: Position, deltaTime: number): void {
    // Calculate direction to player
    const dx = playerPos.x - enemy.x;
    const dy = playerPos.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      // Normalize direction
      const dirX = dx / distance;
      const dirY = dy / distance;
      
      // Calculate new position
      const speed = enemy.speed;
      const newX = enemy.x + dirX * speed * deltaTime;
      const newY = enemy.y + dirY * speed * deltaTime;
      
      // Enemy radius for collision detection (~10 pixels)
      const enemyRadius = 10;
      
      // Check wall collision before moving
      if (this.canMoveTo(newX, newY, enemyRadius)) {
        enemy.x = newX;
        enemy.y = newY;
        enemy.velocityX = dirX * speed;
        enemy.velocityY = dirY * speed;
      } else {
        // Try moving in just X or just Y direction (wall avoidance)
        if (this.canMoveTo(newX, enemy.y, enemyRadius)) {
          enemy.x = newX;
          enemy.velocityX = dirX * speed;
          enemy.velocityY = 0;
        } else if (this.canMoveTo(enemy.x, newY, enemyRadius)) {
          enemy.y = newY;
          enemy.velocityX = 0;
          enemy.velocityY = dirY * speed;
        } else {
          // Can't move at all
          enemy.velocityX = 0;
          enemy.velocityY = 0;
        }
      }
      
      // Update target position (for potential rendering)
      enemy.targetX = playerPos.x;
      enemy.targetY = playerPos.y;
    }
  }
  
  /**
   * Check if an enemy can move to a position without hitting walls
   * Uses corner-based hitbox collision similar to player
   */
  private canMoveTo(x: number, y: number, radius: number): boolean {
    if (!this.mapSystem) {
      return false;
    }
    
    const tileSize = MAZE_CONFIG.TILE_SIZE;
    
    // Check all four corners of the enemy's hitbox
    const corners = [
      { x: x - radius, y: y - radius }, // top-left
      { x: x + radius, y: y - radius }, // top-right
      { x: x - radius, y: y + radius }, // bottom-left
      { x: x + radius, y: y + radius }, // bottom-right
    ];
    
    for (const corner of corners) {
      const gridX = Math.floor(corner.x / tileSize);
      const gridY = Math.floor(corner.y / tileSize);
      
      if (!this.mapSystem.isWalkable(gridX, gridY)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get all enemies
   */
  getEnemies(): Enemy[] {
    return this.enemies;
  }
  
  /**
   * Check if any enemy is colliding with the player
   * Returns true if collision detected (game over condition)
   */
  checkPlayerCollision(playerPos: Position, playerRadius: number): boolean {
    const enemyRadius = 10;
    
    for (const enemy of this.enemies) {
      const dx = playerPos.x - enemy.x;
      const dy = playerPos.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Collision if distance is less than sum of radii
      const collisionDistance = playerRadius + enemyRadius;
      if (distance < collisionDistance) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Reset all enemies (for game restart)
   */
  reset(): void {
    this.enemies = [];
  }
}
