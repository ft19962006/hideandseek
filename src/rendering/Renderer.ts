// 交通捉伊人 - Canvas Renderer

import { Position, PlayerState, Direction, Enemy, MazeGameState } from '@/types';
import { gameConfig, mapColors, playerColors, transportColors } from '@/config/gameConfig';
import { MapSystem } from '@/systems/MapSystem';
import { PlayerSystem } from '@/systems/PlayerSystem';
import { TransportSystem } from '@/systems/TransportSystem';
import { StaminaSystem } from '@/systems/StaminaSystem';
import { MoneySystem } from '@/systems/MoneySystem';
import { EnemySystem } from '@/systems/EnemySystem';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mapSystem: MapSystem;
  private playerSystem: PlayerSystem;
  private transportSystem: TransportSystem;
  private staminaSystem: StaminaSystem;
  private moneySystem: MoneySystem;
  private enemySystem: EnemySystem | null = null;
  private mazeGameState: MazeGameState | null = null;
  
  // Camera for viewport
  private cameraOffset: Position = { x: 0, y: 0 };
  
  constructor(
    canvas: HTMLCanvasElement,
    mapSystem: MapSystem,
    playerSystem: PlayerSystem,
    transportSystem: TransportSystem,
    staminaSystem: StaminaSystem,
    moneySystem: MoneySystem
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
    
    this.mapSystem = mapSystem;
    this.playerSystem = playerSystem;
    this.transportSystem = transportSystem;
    this.staminaSystem = staminaSystem;
    this.moneySystem = moneySystem;
    
    // Set canvas size
    this.resize(gameConfig.canvas.width, gameConfig.canvas.height);
  }
  
  /**
   * Resize canvas
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }
  
  /**
   * Set MapSystem reference for rendering map
   */
  setMapSystem(mapSystem: MapSystem): void {
    this.mapSystem = mapSystem;
  }
  
  /**
   * Set EnemySystem reference for rendering enemies
   */
  setEnemySystem(enemySystem: EnemySystem): void {
    this.enemySystem = enemySystem;
  }
  
  /**
   * Set MazeGameState reference for rendering game state
   */
  setMazeGameState(state: MazeGameState): void {
    this.mazeGameState = state;
  }
  
  /**
   * Main render function
   */
  render(): void {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update camera to follow player
    this.updateCamera();
    
    // Save context state
    this.ctx.save();
    
    // Apply camera transform
    this.ctx.translate(-this.cameraOffset.x, -this.cameraOffset.y);
    
    // Render layers
    this.renderMap();
    // this.renderStops();
    // this.renderTransports();
    this.renderPlayer();
    this.renderEnemies();
    
    // Restore context state
    this.ctx.restore();
    
    // Render HUD (not affected by camera)
    this.renderHUD();
    this.renderSurvivalTimer();
    this.renderGameOverlay();
  }
  
  /**
   * Update camera to follow player
   */
  private updateCamera(): void {
    const playerPos = this.playerSystem.getPosition();
    const mapSize = this.mapSystem.getWorldSize();
    
    // Center camera on player
    let targetX = playerPos.x - this.canvas.width / 2;
    let targetY = playerPos.y - this.canvas.height / 2;
    
    // Clamp to map boundaries
    targetX = Math.max(0, Math.min(mapSize.width - this.canvas.width, targetX));
    targetY = Math.max(0, Math.min(mapSize.height - this.canvas.height, targetY));
    
    // Smooth camera follow
    this.cameraOffset.x += (targetX - this.cameraOffset.x) * 0.1;
    this.cameraOffset.y += (targetY - this.cameraOffset.y) * 0.1;
  }
  
  /**
   * Render the map grid
   */
  private renderMap(): void {
    const mapData = this.mapSystem.getMapData();
    const tileSize = mapData.tileSize;
    
    for (let y = 0; y < mapData.height; y++) {
      for (let x = 0; x < mapData.width; x++) {
        const tile = mapData.tiles[y][x];
        const worldX = x * tileSize;
        const worldY = y * tileSize;
        
        // Skip tiles outside viewport
        if (!this.isInViewport(worldX, worldY, tileSize, tileSize)) {
          continue;
        }
        
        // Draw tile
        switch (tile.type) {
          case 'road':
            this.ctx.fillStyle = mapColors.road;
            break;
          case 'wall':
            this.ctx.fillStyle = mapColors.wall;
            break;
          case 'building':
            this.ctx.fillStyle = mapColors.building;
            break;
          case 'grass':
            this.ctx.fillStyle = mapColors.grass;
            break;
          case 'stop':
            this.ctx.fillStyle = mapColors.stop;
            break;
          default:
            this.ctx.fillStyle = mapColors.road;
        }
        
        this.ctx.fillRect(worldX, worldY, tileSize, tileSize);
        
        // Draw grid lines
        this.ctx.strokeStyle = mapColors.grid;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(worldX, worldY, tileSize, tileSize);
      }
    }
  }
  
  /**
   * Render transport stops (Disabled for Maze Mode)
   */
  private renderStops(): void {
    // Disabled
  }
  
  /**
   * Render transport vehicles (Disabled for Maze Mode)
   */
  private renderTransports(): void {
    // Disabled
  }
  
  /**
   * Render the player
   */
  private renderPlayer(): void {
    const player = this.playerSystem.getPlayer();
    const { x, y } = player.position;
    
    this.ctx.save();
    
    // Player shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y + 12, 10, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Player body (circle)
    this.ctx.fillStyle = playerColors.fill;
    this.ctx.strokeStyle = playerColors.stroke;
    this.ctx.lineWidth = 2;
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, 12, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Direction indicator
    this.renderDirectionIndicator(x, y, player.direction);
    
    // State indicator (running effect)
    if (player.state === 'running') {
      this.ctx.strokeStyle = '#FFD700';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([4, 4]);
      this.ctx.beginPath();
      this.ctx.arc(x, y, 16, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
    
    this.ctx.restore();
  }
  
  /**
   * Render enemies as red circles
   */
  private renderEnemies(): void {
    if (!this.enemySystem) return;
    
    const enemies = this.enemySystem.getEnemies();
    this.ctx.save();
    
    for (const enemy of enemies) {
      // Draw enemy as red circle (camera transform already applied)
      this.ctx.fillStyle = '#FF0000';
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, 12, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add glow effect
      this.ctx.strokeStyle = '#FF6666';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
  
  /**
   * Render survival timer at top center
   */
  private renderSurvivalTimer(): void {
    if (!this.mazeGameState) return;
    
    const timeRemaining = Math.max(0,
      this.mazeGameState.targetTime - this.mazeGameState.survivalTime
    );
    const timeText = `Time: ${timeRemaining.toFixed(1)}s`;
    
    this.ctx.save();
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(timeText, this.canvas.width / 2, 40);
    
    // Progress bar
    const barWidth = 200;
    const barHeight = 10;
    const barX = (this.canvas.width - barWidth) / 2;
    const barY = 50;
    const progress = this.mazeGameState.survivalTime / this.mazeGameState.targetTime;
    
    // Background
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Progress fill (green)
    this.ctx.fillStyle = '#00FF00';
    this.ctx.fillRect(barX, barY, barWidth * Math.min(progress, 1), barHeight);
    
    this.ctx.restore();
  }
  
  /**
   * Render game overlay (win/lose screens)
   */
  private renderGameOverlay(): void {
    if (!this.mazeGameState) return;
    
    if (this.mazeGameState.status === 'won') {
      this.renderWinScreen();
    } else if (this.mazeGameState.status === 'lost') {
      this.renderLoseScreen();
    }
  }
  
  /**
   * Render win screen overlay
   */
  private renderWinScreen(): void {
    this.ctx.save();
    // Semi-transparent green overlay
    this.ctx.fillStyle = 'rgba(0, 128, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Win text
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('YOU WIN!', this.canvas.width / 2, this.canvas.height / 2 - 20);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText('You survived 30 seconds!', this.canvas.width / 2, this.canvas.height / 2 + 30);
    this.ctx.fillText('Press SPACE or R to restart', this.canvas.width / 2, this.canvas.height / 2 + 70);
    this.ctx.restore();
  }
  
  /**
   * Render lose screen overlay
   */
  private renderLoseScreen(): void {
    this.ctx.save();
    // Semi-transparent red overlay
    this.ctx.fillStyle = 'rgba(128, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Lose text
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
    
    this.ctx.font = '24px Arial';
    const time = this.mazeGameState?.survivalTime.toFixed(1) || '0';
    this.ctx.fillText(`You survived ${time} seconds`, this.canvas.width / 2, this.canvas.height / 2 + 30);
    this.ctx.fillText('Press SPACE or R to restart', this.canvas.width / 2, this.canvas.height / 2 + 70);
    this.ctx.restore();
  }
  
  /**
   * Render direction indicator on player
   */
  private renderDirectionIndicator(x: number, y: number, direction: Direction): void {
    this.ctx.fillStyle = '#FFFFFF';
    
    let indicatorX = x;
    let indicatorY = y;
    
    switch (direction) {
      case 'up':
        indicatorY -= 4;
        break;
      case 'down':
        indicatorY += 4;
        break;
      case 'left':
        indicatorX -= 4;
        break;
      case 'right':
        indicatorX += 4;
        break;
    }
    
    this.ctx.beginPath();
    this.ctx.arc(indicatorX, indicatorY, 3, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  /**
   * Render HUD (heads-up display)
   */
  private renderHUD(): void {
    const padding = 10;
    const barWidth = 200;
    const barHeight = 20;
    
    // Stamina bar background
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(padding, padding, barWidth, barHeight);
    
    // Stamina bar fill
    const staminaPercent = this.staminaSystem.getStaminaPercent();
    const staminaColor = this.staminaSystem.getIsExhausted() ? '#FF4444' : '#4CAF50';
    this.ctx.fillStyle = staminaColor;
    this.ctx.fillRect(padding + 2, padding + 2, (barWidth - 4) * staminaPercent, barHeight - 4);
    
    // Stamina text
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      `體力: ${Math.floor(this.staminaSystem.getCurrentStamina())}/${this.staminaSystem.getMaxStamina()}`,
      padding + 5,
      padding + barHeight / 2
    );
    
    // Money display
    const money = this.moneySystem.getBalance();
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`$${money}`, padding + barWidth + 20, padding + barHeight / 2);
    
    // Player state
    const state = this.playerSystem.getState();
    const stateText = this.getStateText(state);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`狀態: ${stateText}`, padding, padding + barHeight + 15);
    
    // Controls hint
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('WASD 移動 | Shift 跑步 | E 互動', padding, this.canvas.height - 10);
    
    // Nearby stop indicator
    // this.renderNearbyStopHint();
  }
  
  /**
   * Render hint when near a transport stop (Disabled for Maze Mode)
   */
  private renderNearbyStopHint(): void {
    // Disabled
  }
  
  /**
   * Get display text for player state
   */
  private getStateText(state: PlayerState): string {
    switch (state) {
      case 'idle': return '待機';
      case 'walking': return '步行中';
      case 'running': return '跑步中';
      case 'boarding': return '上車中';
      case 'onTransport': return '乘車中';
      default: return state;
    }
  }
  
  /**
   * Check if a rectangle is in the viewport
   */
  private isInViewport(x: number, y: number, width: number, height: number): boolean {
    const viewLeft = this.cameraOffset.x;
    const viewTop = this.cameraOffset.y;
    const viewRight = viewLeft + this.canvas.width;
    const viewBottom = viewTop + this.canvas.height;
    
    return x + width > viewLeft && x < viewRight &&
           y + height > viewTop && y < viewBottom;
  }
}
