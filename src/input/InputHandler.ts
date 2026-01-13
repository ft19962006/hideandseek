// 交通捉伊人 - Input Handler

import { InputState } from '@/types';

export class InputHandler {
  private state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    run: false,
    interact: false,
    pause: false,
    map: false,
    restart: false,
  };
  
  // Track which keys were just pressed this frame
  private justPressed: Set<string> = new Set();
  
  // Key mappings
  private readonly keyMap: Record<string, keyof InputState> = {
    'KeyW': 'up',
    'ArrowUp': 'up',
    'KeyS': 'down',
    'ArrowDown': 'down',
    'KeyA': 'left',
    'ArrowLeft': 'left',
    'KeyD': 'right',
    'ArrowRight': 'right',
    'ShiftLeft': 'run',
    'ShiftRight': 'run',
    'KeyE': 'interact',
    'Space': 'restart',
    'KeyR': 'restart',
    'Escape': 'pause',
    'KeyM': 'map',
  };
  
  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }
  
  /**
   * Initialize input listeners
   */
  init(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    console.log('[InputHandler] Initialized');
  }
  
  /**
   * Clean up input listeners
   */
  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    console.log('[InputHandler] Destroyed');
  }
  
  /**
   * Handle key down events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const action = this.keyMap[event.code];
    if (action) {
      event.preventDefault();
      
      // Track just pressed (only on initial press, not repeat)
      if (!event.repeat && !this.state[action]) {
        this.justPressed.add(action);
      }
      
      this.state[action] = true;
    }
  }
  
  /**
   * Handle key up events
   */
  private handleKeyUp(event: KeyboardEvent): void {
    const action = this.keyMap[event.code];
    if (action) {
      event.preventDefault();
      this.state[action] = false;
    }
  }
  
  /**
   * Get current input state
   */
  getState(): InputState {
    return { ...this.state };
  }
  
  /**
   * Check if a specific input is currently pressed
   */
  isPressed(action: keyof InputState): boolean {
    return this.state[action];
  }
  
  /**
   * Check if a specific input was just pressed this frame
   */
  isJustPressed(action: keyof InputState): boolean {
    return this.justPressed.has(action);
  }
  
  /**
   * Clear just pressed states (call at end of each frame)
   */
  clearJustPressed(): void {
    this.justPressed.clear();
  }
  
  /**
   * Get movement direction vector based on current input
   */
  getMovementVector(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    
    if (this.state.left) x -= 1;
    if (this.state.right) x += 1;
    if (this.state.up) y -= 1;
    if (this.state.down) y += 1;
    
    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      x /= length;
      y /= length;
    }
    
    return { x, y };
  }
  
  /**
   * Check if any movement key is pressed
   */
  isMoving(): boolean {
    return this.state.up || this.state.down || this.state.left || this.state.right;
  }
}
