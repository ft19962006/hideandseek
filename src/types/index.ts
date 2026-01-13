// 交通捉伊人 - Type Definitions

// ============================================
// Position & Direction Types
// ============================================

export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export interface Vector2 {
  x: number;
  y: number;
}

// ============================================
// Player Types
// ============================================

export type PlayerState = 'idle' | 'walking' | 'running' | 'boarding' | 'onTransport';

export interface Player {
  id: string;
  position: Position;
  velocity: Vector2;
  state: PlayerState;
  direction: Direction;
  stamina: number;
  maxStamina: number;
  money: number;
  currentTransport: string | null; // Transport vehicle ID
  movementSpeed: number;
}

// ============================================
// Transport Types
// ============================================

export type TransportType = 'bus' | 'metro' | 'taxi';

export interface TransportStop {
  id: string;
  name: string;
  position: Position;
  types: TransportType[]; // What types of transport stop here
}

export interface TransportRoute {
  id: string;
  type: TransportType;
  stops: string[]; // Array of stop IDs in order
  isLoop: boolean;
}

export interface TransportVehicle {
  id: string;
  type: TransportType;
  routeId: string;
  position: Position;
  currentStopIndex: number;
  nextStopIndex: number;
  passengers: string[]; // Player IDs
  speed: number;
  isMoving: boolean;
  waitTimer: number;
}

// ============================================
// Map Types
// ============================================

export type TileType = 'road' | 'building' | 'stop' | 'grass' | 'wall';

export interface Tile {
  type: TileType;
  walkable: boolean;
  stopId?: string; // If this tile contains a transport stop
}

export interface MapData {
  width: number;
  height: number;
  tileSize: number;
  tiles: Tile[][];
  stops: TransportStop[];
  routes: TransportRoute[];
}

// ============================================
// Game State Types
// ============================================

export interface GameState {
  player: Player;
  map: MapData;
  transports: TransportVehicle[];
  gameTime: number; // Total elapsed time in seconds
  isPaused: boolean;
  isLoading: boolean;
}

// ============================================
// Input Types
// ============================================

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  run: boolean;    // Shift key
  interact: boolean; // E key
  pause: boolean;  // ESC key
  map: boolean;    // M key
  restart: boolean; // R key or Space key (for restarting after win/lose)
}

// ============================================
// UI Types
// ============================================

export interface HUDData {
  stamina: number;
  maxStamina: number;
  money: number;
  currentState: PlayerState;
  nearbyStop: TransportStop | null;
}

export interface TransportPanelData {
  stop: TransportStop;
  availableTransports: TransportVehicle[];
  isVisible: boolean;
}

// ============================================
// Configuration Types
// ============================================

export interface GameConfig {
  canvas: {
    width: number;
    height: number;
  };
  player: {
    startPosition: Position;
    walkSpeed: number;
    runSpeed: number;
    initialMoney: number;
    initialStamina: number;
    maxStamina: number;
  };
  stamina: {
    walkCostPerSecond: number;
    runCostPerSecond: number;
    idleRecoveryPerSecond: number;
    transportRecoveryPerSecond: number;
    exhaustedSpeedMultiplier: number;
  };
  transport: {
    bus: {
      speed: number;
      cost: number;
      waitTime: number;
    };
    metro: {
      speed: number;
      cost: number;
      waitTime: number;
    };
    taxi: {
      speed: number;
      cost: number;
      waitTime: number;
    };
  };
  map: {
    width: number;
    height: number;
    tileSize: number;
  };
}

// ============================================
// Event Types
// ============================================

export type GameEventType = 
  | 'player_move'
  | 'player_stop'
  | 'stamina_change'
  | 'money_change'
  | 'transport_board'
  | 'transport_exit'
  | 'transport_arrive'
  | 'game_pause'
  | 'game_resume';

export interface GameEvent {
  type: GameEventType;
  data?: unknown;
  timestamp: number;
}

// ============================================
// Maze Survival Types
// ============================================

export interface Enemy {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  speed: number;
  targetX: number;
  targetY: number;
  pathUpdateTimer: number;
}

export type MazeGameStatus = 'playing' | 'won' | 'lost';

export interface MazeGameState {
  status: MazeGameStatus;
  survivalTime: number;
  targetTime: number;
  enemies: Enemy[];
}
