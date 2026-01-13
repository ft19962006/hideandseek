// 交通捉伊人 - Transport System (Disabled for Maze Mode)

import { Position, TransportVehicle } from '@/types';
import { MapSystem } from './MapSystem';

export type TransportEventCallback = (event: any) => void;

export class TransportSystem {
  constructor(_mapSystem: MapSystem) {}
  
  init(): void {
    console.log('[TransportSystem] Disabled for Maze Mode');
  }
  
  update(_deltaTime: number): void {}
  
  getVehicles(): TransportVehicle[] {
    return [];
  }
  
  getVehicle(_vehicleId: string): TransportVehicle | undefined {
    return undefined;
  }
  
  getAvailableVehiclesAtStop(_stopId: string): TransportVehicle[] {
    return [];
  }
  
  boardVehicle(_playerId: string, _vehicleId: string): boolean {
    return false;
  }
  
  exitVehicle(_playerId: string, _vehicleId: string): Position | null {
    return null;
  }
  
  getVehiclePosition(_vehicleId: string): Position | null {
    return null;
  }
  
  isVehicleAtStop(_vehicleId: string): boolean {
    return false;
  }
  
  onEvent(_callback: TransportEventCallback): void {}
}
