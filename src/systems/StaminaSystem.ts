// 交通捉伊人 - Stamina System

import { PlayerState } from '@/types';
import { gameConfig } from '@/config/gameConfig';

export type StaminaChangeCallback = (current: number, max: number) => void;

export class StaminaSystem {
  private currentStamina: number;
  private maxStamina: number;
  private isExhausted: boolean = false;
  
  // Callbacks for stamina changes
  private changeCallbacks: StaminaChangeCallback[] = [];
  
  constructor() {
    this.currentStamina = gameConfig.player.initialStamina;
    this.maxStamina = gameConfig.player.maxStamina;
  }
  
  /**
   * Initialize the stamina system
   */
  init(maxStamina?: number): void {
    this.maxStamina = maxStamina ?? gameConfig.player.maxStamina;
    this.currentStamina = this.maxStamina;
    this.isExhausted = false;
    this.notifyChange();
    console.log(`[StaminaSystem] Initialized with ${this.maxStamina} max stamina`);
  }
  
  /**
   * Update stamina based on player state
   * @param deltaTime Time since last update in seconds
   * @param playerState Current player state
   */
  update(deltaTime: number, playerState: PlayerState): void {
    const config = gameConfig.stamina;
    let staminaChange = 0;
    
    switch (playerState) {
      case 'idle':
        // Recover stamina when idle
        staminaChange = config.idleRecoveryPerSecond * deltaTime;
        break;
        
      case 'walking':
        // Consume stamina when walking
        staminaChange = -config.walkCostPerSecond * deltaTime;
        break;
        
      case 'running':
        // Consume more stamina when running
        staminaChange = -config.runCostPerSecond * deltaTime;
        break;
        
      case 'onTransport':
        // Recover stamina while on transport
        staminaChange = config.transportRecoveryPerSecond * deltaTime;
        break;
        
      case 'boarding':
        // No change during boarding
        break;
    }
    
    if (staminaChange !== 0) {
      this.modifyStamina(staminaChange);
    }
  }
  
  /**
   * Modify stamina by a specific amount
   */
  private modifyStamina(amount: number): void {
    const oldStamina = this.currentStamina;
    this.currentStamina = Math.max(0, Math.min(this.maxStamina, this.currentStamina + amount));
    
    // Check for exhaustion state changes
    if (this.currentStamina <= 0 && !this.isExhausted) {
      this.isExhausted = true;
      console.log('[StaminaSystem] Player is exhausted!');
    } else if (this.currentStamina > 20 && this.isExhausted) {
      // Recover from exhaustion when stamina > 20%
      this.isExhausted = false;
      console.log('[StaminaSystem] Player recovered from exhaustion');
    }
    
    // Notify if stamina changed
    if (Math.abs(oldStamina - this.currentStamina) > 0.01) {
      this.notifyChange();
    }
  }
  
  /**
   * Consume a specific amount of stamina
   * @returns true if consumption was successful, false if not enough stamina
   */
  consume(amount: number): boolean {
    if (this.currentStamina >= amount) {
      this.modifyStamina(-amount);
      return true;
    }
    return false;
  }
  
  /**
   * Recover a specific amount of stamina
   */
  recover(amount: number): void {
    this.modifyStamina(amount);
  }
  
  /**
   * Get current stamina value
   */
  getCurrentStamina(): number {
    return this.currentStamina;
  }
  
  /**
   * Get maximum stamina value
   */
  getMaxStamina(): number {
    return this.maxStamina;
  }
  
  /**
   * Get stamina percentage (0-1)
   */
  getStaminaPercent(): number {
    return this.currentStamina / this.maxStamina;
  }
  
  /**
   * Check if player is exhausted
   */
  getIsExhausted(): boolean {
    return this.isExhausted;
  }
  
  /**
   * Get speed multiplier based on exhaustion
   */
  getSpeedMultiplier(): number {
    return this.isExhausted ? gameConfig.stamina.exhaustedSpeedMultiplier : 1;
  }
  
  /**
   * Register a callback for stamina changes
   */
  onChange(callback: StaminaChangeCallback): void {
    this.changeCallbacks.push(callback);
  }
  
  /**
   * Remove a stamina change callback
   */
  offChange(callback: StaminaChangeCallback): void {
    const index = this.changeCallbacks.indexOf(callback);
    if (index > -1) {
      this.changeCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Notify all callbacks of stamina change
   */
  private notifyChange(): void {
    for (const callback of this.changeCallbacks) {
      callback(this.currentStamina, this.maxStamina);
    }
  }
}
