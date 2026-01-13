// 交通捉伊人 - Game Loop

export type UpdateCallback = (deltaTime: number) => void;
export type RenderCallback = () => void;

export class GameLoop {
  private lastTime: number = 0;
  private accumulatedTime: number = 0;
  private readonly fixedTimeStep: number = 1000 / 60; // 60 FPS for physics
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  
  private updateCallbacks: UpdateCallback[] = [];
  private renderCallbacks: RenderCallback[] = [];
  
  // Performance monitoring
  private fps: number = 0;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;
  
  constructor() {
    this.loop = this.loop.bind(this);
  }
  
  /**
   * Register an update callback (called with fixed time step)
   */
  onUpdate(callback: UpdateCallback): void {
    this.updateCallbacks.push(callback);
  }
  
  /**
   * Register a render callback (called every frame)
   */
  onRender(callback: RenderCallback): void {
    this.renderCallbacks.push(callback);
  }
  
  /**
   * Remove an update callback
   */
  offUpdate(callback: UpdateCallback): void {
    const index = this.updateCallbacks.indexOf(callback);
    if (index > -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Remove a render callback
   */
  offRender(callback: RenderCallback): void {
    const index = this.renderCallbacks.indexOf(callback);
    if (index > -1) {
      this.renderCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Start the game loop
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulatedTime = 0;
    this.fpsUpdateTime = this.lastTime;
    this.frameCount = 0;
    
    this.animationFrameId = requestAnimationFrame(this.loop);
    console.log('[GameLoop] Started');
  }
  
  /**
   * Stop the game loop
   */
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    console.log('[GameLoop] Stopped');
  }
  
  /**
   * Main loop function
   */
  private loop(currentTime: number): void {
    if (!this.isRunning) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.accumulatedTime += deltaTime;
    
    // Fixed time step updates (for physics/game logic)
    while (this.accumulatedTime >= this.fixedTimeStep) {
      const fixedDelta = this.fixedTimeStep / 1000; // Convert to seconds
      
      for (const callback of this.updateCallbacks) {
        callback(fixedDelta);
      }
      
      this.accumulatedTime -= this.fixedTimeStep;
    }
    
    // Render (every frame)
    for (const callback of this.renderCallbacks) {
      callback();
    }
    
    // FPS calculation
    this.frameCount++;
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }
    
    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.loop);
  }
  
  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }
  
  /**
   * Check if loop is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }
}
