import { DeliveryJob } from 'ludum-dare-54/game/delivery-job-generator';
import { Truck } from 'ludum-dare-54/game/truck';
import { Upgrades, getCargoStorageForLevel } from 'ludum-dare-54/game/upgrades';
import { WorldMap } from 'ludum-dare-54/game/world-map';
import { Rectangle, Vector2 } from 'ponczek';

export interface CargoStorage {
  bounds: Rectangle,
  cargo: Cargo[],
}

export interface Cargo {
  position: Vector2,
  rects: Rectangle[],
  parentJobId: number,
}

export interface ActiveJob {
  job: DeliveryJob,
  completeUntilTime: number,
}

export class GameState {
  static seed: number;
  static world: WorldMap;
  static truck: Truck;
  static activeJobs: ActiveJob[];
  static cash: number;
  static points: number;
  static cargoStorage: CargoStorage;
  static time: number;
  static completedJobs: number;
  static distanceDriven: number;
  static isAdvancedPlayer: boolean;
  static upgrades: Upgrades;

  static create(seed: number): void {
    GameState.seed = seed;

    GameState.world = new WorldMap(400, seed);
    GameState.world.generate();

    const firstCityPos = GameState.world.cities[0].position.copy();
    GameState.truck = new Truck(firstCityPos);

    GameState.activeJobs = [];

    GameState.cash = 100000;
    GameState.points = 0;

    GameState.cargoStorage = {
      bounds: getCargoStorageForLevel(4),
      cargo: [],
    };

    GameState.time = 0;

    GameState.completedJobs = 0;
    GameState.distanceDriven = 0;
    GameState.isAdvancedPlayer = false;

    GameState.upgrades = {
      cargoLevel: 0,
      terrainPack: false,
      speedBoost: false,
      batteryLevel: 0,
      highEfficiency: false,
      fastCharging: false,
      gps: false,
    };
  }
}
