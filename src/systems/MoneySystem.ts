// 交通捉伊人 - Money System

import { gameConfig } from '@/config/gameConfig';

export type MoneyChangeCallback = (balance: number, change: number) => void;

export class MoneySystem {
  private balance: number;
  
  // Callbacks for money changes
  private changeCallbacks: MoneyChangeCallback[] = [];
  
  constructor() {
    this.balance = gameConfig.player.initialMoney;
  }
  
  /**
   * Initialize the money system
   */
  init(startingMoney?: number): void {
    this.balance = startingMoney ?? gameConfig.player.initialMoney;
    this.notifyChange(0); // Initial notification
    console.log(`[MoneySystem] Initialized with $${this.balance}`);
  }
  
  /**
   * Spend money
   * @returns true if transaction was successful, false if insufficient funds
   */
  spend(amount: number): boolean {
    if (amount <= 0) {
      console.warn('[MoneySystem] Invalid spend amount:', amount);
      return false;
    }
    
    if (this.balance >= amount) {
      this.balance -= amount;
      this.notifyChange(-amount);
      console.log(`[MoneySystem] Spent $${amount}, balance: $${this.balance}`);
      return true;
    }
    
    console.log(`[MoneySystem] Insufficient funds. Need $${amount}, have $${this.balance}`);
    return false;
  }
  
  /**
   * Earn money
   */
  earn(amount: number): void {
    if (amount <= 0) {
      console.warn('[MoneySystem] Invalid earn amount:', amount);
      return;
    }
    
    this.balance += amount;
    this.notifyChange(amount);
    console.log(`[MoneySystem] Earned $${amount}, balance: $${this.balance}`);
  }
  
  /**
   * Get current balance
   */
  getBalance(): number {
    return this.balance;
  }
  
  /**
   * Check if player can afford an amount
   */
  canAfford(amount: number): boolean {
    return this.balance >= amount;
  }
  
  /**
   * Get cost for a specific transport type
   */
  getTransportCost(transportType: 'bus' | 'metro' | 'taxi'): number {
    return gameConfig.transport[transportType].cost;
  }
  
  /**
   * Check if player can afford a specific transport
   */
  canAffordTransport(transportType: 'bus' | 'metro' | 'taxi'): boolean {
    return this.canAfford(this.getTransportCost(transportType));
  }
  
  /**
   * Pay for transport
   * @returns true if payment was successful
   */
  payForTransport(transportType: 'bus' | 'metro' | 'taxi'): boolean {
    const cost = this.getTransportCost(transportType);
    return this.spend(cost);
  }
  
  /**
   * Register a callback for money changes
   */
  onChange(callback: MoneyChangeCallback): void {
    this.changeCallbacks.push(callback);
  }
  
  /**
   * Remove a money change callback
   */
  offChange(callback: MoneyChangeCallback): void {
    const index = this.changeCallbacks.indexOf(callback);
    if (index > -1) {
      this.changeCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Notify all callbacks of money change
   */
  private notifyChange(change: number): void {
    for (const callback of this.changeCallbacks) {
      callback(this.balance, change);
    }
  }
}
