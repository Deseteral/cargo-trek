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

export interface SerializedGameData {
  seed: number,
  truckPositionX: number,
  truckPositionY: number,
  truckBattery: number,
  truckBatteryCapacity: number,
  cash: number,
  points: number,
  time: number,
  completedJobs: number,
  distanceDriven: number,
  isAdvancedPlayer: boolean,
  upgrades: Upgrades,
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

    GameState.world = new WorldMap(seed);
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

  static serialize(): SerializedGameData {
    return {
      seed: GameState.seed,
      truckPositionX: GameState.truck.position.x,
      truckPositionY: GameState.truck.position.y,
      truckBattery: GameState.truck.battery,
      truckBatteryCapacity: GameState.truck.batteryCapacity,
      cash: GameState.cash,
      points: GameState.points,
      time: GameState.time,
      completedJobs: GameState.completedJobs,
      distanceDriven: GameState.distanceDriven,
      isAdvancedPlayer: GameState.isAdvancedPlayer,
      upgrades: GameState.upgrades,
    };
  }

  static deserialize(data: SerializedGameData): void {
    GameState.seed = data.seed;

    GameState.world = new WorldMap(data.seed);
    GameState.world.generate();

    GameState.truck = new Truck(new Vector2(data.truckPositionX, data.truckPositionY));
    GameState.truck.battery = data.truckBattery;
    GameState.truck.batteryCapacity = data.truckBatteryCapacity;

    GameState.activeJobs = []; // TODO

    GameState.cash = data.cash;
    GameState.points = data.points;

    GameState.cargoStorage = {
      bounds: getCargoStorageForLevel(data.upgrades.cargoLevel),
      cargo: [], // TODO
    };

    GameState.time = data.time;
    GameState.completedJobs = data.completedJobs;
    GameState.distanceDriven = data.distanceDriven;
    GameState.isAdvancedPlayer = data.isAdvancedPlayer;
    GameState.upgrades = data.upgrades;
  }
}
