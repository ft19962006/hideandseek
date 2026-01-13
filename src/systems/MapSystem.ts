// 交通捉伊人 - Map System

import { Position, MapData, Tile } from '@/types';
import { MAZE_CONFIG } from '@/config/gameConfig';

export class MapSystem {
  private mapData: MapData;
  
  constructor() {
    // Initialize maze map
    this.mapData = this.generateMaze();
  }
  
  /**
   * Generate a maze using Recursive Backtracking algorithm
   */
  private generateMaze(): MapData {
    const width = MAZE_CONFIG.WIDTH;
    const height = MAZE_CONFIG.HEIGHT;
    const tileSize = MAZE_CONFIG.TILE_SIZE;
    
    // Initialize grid with all walls
    const tiles: Tile[][] = [];
    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      for (let x = 0; x < width; x++) {
        tiles[y][x] = {
          type: 'wall',
          walkable: false,
        };
      }
    }
    
    // Start from (1,1) - player spawn position
    const startX = 1;
    const startY = 1;
    tiles[startY][startX] = {
      type: 'road',
      walkable: true,
    };
    
    // Recursive carve
    this.carve(startX, startY, tiles, width, height);
    
    return {
      width,
      height,
      tileSize,
      tiles,
      stops: [], // No stops in maze mode
      routes: [], // No routes in maze mode
    };
  }
  
  /**
   * Recursive function to carve passages
   */
  private carve(x: number, y: number, tiles: Tile[][], width: number, height: number): void {
    // Directions: up, down, left, right (in random order)
    const directions = [
      { dx: 0, dy: -2 },
      { dx: 0, dy: 2 },
      { dx: -2, dy: 0 },
      { dx: 2, dy: 0 }
    ].sort(() => Math.random() - 0.5);
    
    for (const { dx, dy } of directions) {
      const newX = x + dx;
      const newY = y + dy;
      
      // Check if newX, newY is within bounds and is a wall
      if (newX > 0 && newX < width && newY > 0 && newY < height && tiles[newY][newX].type === 'wall') {
        // Carve the wall between current and new cell
          const midX = x + Math.floor(dx / 2);
          const midY = y + Math.floor(dy / 2);
          tiles[midY][midX] = {
            type: 'road',
            walkable: true,
          };
        tiles[newY][newX] = {
          type: 'road',
          walkable: true,
        };
        
        this.carve(newX, newY, tiles, width, height);
      }
    }
  }
  
  /**
   * Initialize the map system
   */
  init(): void {
    console.log('[MapSystem] Initialized maze map');
  }
  
  /**
   * Get map data
   */
  getMapData(): MapData {
    return this.mapData;
  }
  
  /**
   * Get tile at grid position
   */
  getTile(gridX: number, gridY: number): Tile | null {
    if (gridX < 0 || gridX >= this.mapData.width || 
        gridY < 0 || gridY >= this.mapData.height) {
      return null;
    }
    return this.mapData.tiles[gridY][gridX];
  }
  
  /**
   * Get tile at world position
   */
  getTileAtWorld(worldX: number, worldY: number): Tile | null {
    const gridX = Math.floor(worldX / this.mapData.tileSize);
    const gridY = Math.floor(worldY / this.mapData.tileSize);
    return this.getTile(gridX, gridY);
  }
  
  /**
   * Check if position is walkable
   */
  isWalkable(gridX: number, gridY: number): boolean {
    const tile = this.getTile(gridX, gridY);
    return tile ? tile.walkable : false;
  }
  
  /**
   * Get player spawn position in pixels (center of tile 1,1)
   */
  getPlayerSpawnPosition(): Position {
    return this.gridToWorld(1, 1);
  }
  
  /**
   * Convert grid position to world position (center of tile)
   */
  gridToWorld(gridX: number, gridY: number): Position {
    const tileSize = this.mapData.tileSize;
    return {
      x: gridX * tileSize + tileSize / 2,
      y: gridY * tileSize + tileSize / 2,
    };
  }
  
  /**
   * Convert world position to grid position
   */
  worldToGrid(worldX: number, worldY: number): Position {
    return {
      x: Math.floor(worldX / this.mapData.tileSize),
      y: Math.floor(worldY / this.mapData.tileSize),
    };
  }
  
  /**
   * Get map dimensions in pixels
   */
  getWorldSize(): { width: number; height: number } {
    return {
      width: this.mapData.width * this.mapData.tileSize,
      height: this.mapData.height * this.mapData.tileSize,
    };
  }
}
