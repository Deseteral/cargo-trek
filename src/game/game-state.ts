/* eslint-disable @typescript-eslint/no-use-before-define */

import { DeliveryJob } from 'ludum-dare-54/game/delivery-job-generator';
import { Truck } from 'ludum-dare-54/game/truck';
import { Upgrades, getCargoStorageForLevel } from 'ludum-dare-54/game/upgrades';
import { WorldMap } from 'ludum-dare-54/game/world-map';
import { Color, Rectangle, Vector2 } from 'ponczek';

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
  fogMap: string[],
  truckPositionX: number,
  truckPositionY: number,
  truckBattery: number,
  truckBatteryCapacity: number,
  activeJobs: ({ job: SerializedDeliveryJob, completeUntilTime: number })[],
  cash: number,
  points: number,
  cargoStorageCargo: SerializedCargo[],
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

    GameState.upgrades = {
      cargoLevel: 4,
      terrainPack: false,
      speedBoost: false,
      batteryLevel: 0,
      highEfficiency: false,
      fastCharging: false,
      gps: false,
    };

    GameState.cargoStorage = {
      bounds: getCargoStorageForLevel(GameState.upgrades.cargoLevel),
      cargo: [],
    };

    GameState.time = 0;

    GameState.completedJobs = 0;
    GameState.distanceDriven = 0;
    GameState.isAdvancedPlayer = false;
  }

  static serialize(): SerializedGameData {
    return {
      seed: GameState.seed,
      fogMap: serializeFogMap(),
      truckPositionX: GameState.truck.position.x,
      truckPositionY: GameState.truck.position.y,
      truckBattery: GameState.truck.battery,
      truckBatteryCapacity: GameState.truck.batteryCapacity,
      activeJobs: GameState.activeJobs.map(({ job, completeUntilTime }) => ({ job: serializeDeliveryJob(job), completeUntilTime })),
      cash: GameState.cash,
      points: GameState.points,
      cargoStorageCargo: GameState.cargoStorage.cargo.map((c) => serializeCargo(c)),
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
    deserializeFogMap(data.fogMap);

    GameState.truck = new Truck(new Vector2(data.truckPositionX, data.truckPositionY));
    GameState.truck.battery = data.truckBattery;
    GameState.truck.batteryCapacity = data.truckBatteryCapacity;

    GameState.activeJobs = data.activeJobs.map(({ job, completeUntilTime }) => ({ job: deserializeDeliveryJob(job), completeUntilTime }));

    GameState.cash = data.cash;
    GameState.points = data.points;

    GameState.cargoStorage = {
      bounds: getCargoStorageForLevel(data.upgrades.cargoLevel),
      cargo: data.cargoStorageCargo.map((c) => deserializeCargo(c)),
    };

    GameState.time = data.time;
    GameState.completedJobs = data.completedJobs;
    GameState.distanceDriven = data.distanceDriven;
    GameState.isAdvancedPlayer = data.isAdvancedPlayer;
    GameState.upgrades = data.upgrades;
  }
}

interface SerializedCargo {
  positionX: number,
  positionY: number,
  rects: ({ x: number, y: number, w: number, h: number })[],
  parentJobId: number,
}

function serializeCargo(cargo: Cargo): SerializedCargo {
  return {
    positionX: cargo.position.x,
    positionY: cargo.position.y,
    rects: cargo.rects.map((r) => ({ x: r.x, y: r.y, w: r.width, h: r.height })),
    parentJobId: cargo.parentJobId,
  };
}

function deserializeCargo(data: SerializedCargo): Cargo {
  return {
    position: new Vector2(data.positionX, data.positionY),
    rects: data.rects.map(({ x, y, w, h }) => new Rectangle(x, y, w, h)),
    parentJobId: data.parentJobId,
  };
}

interface SerializedDeliveryJob {
  id: number,
  fromCityId: number,
  targetCityId: number,
  price: number,
  cargo: SerializedCargo,
  timeToComplete: number,
  type: string,
}

function serializeDeliveryJob(dj: DeliveryJob): SerializedDeliveryJob {
  return {
    id: dj.id,
    fromCityId: dj.fromCityId,
    targetCityId: dj.targetCityId,
    price: dj.price,
    cargo: serializeCargo(dj.cargo),
    timeToComplete: dj.timeToComplete,
    type: dj.type,
  };
}

function deserializeDeliveryJob(data: SerializedDeliveryJob): DeliveryJob {
  return {
    id: data.id,
    fromCityId: data.fromCityId,
    targetCityId: data.targetCityId,
    price: data.price,
    cargo: deserializeCargo(data.cargo),
    timeToComplete: data.timeToComplete,
    type: data.type,
  };
}

function serializeFogMap(): string[] {
  const out: Color = Color.red;
  const lines: string[] = [];

  for (let y = 0; y < GameState.world.mapSize; y += 1) {
    let line = '';

    for (let x = 0; x < GameState.world.mapSize; x += 1) {
      GameState.world.fogScreen.getPixel(x, y, out);
      line += (out.a === 0) ? '0' : '1';
    }

    lines.push(line);
  }

  return lines;
}

function deserializeFogMap(data: string[]): void {
  for (let y = 0; y < GameState.world.mapSize; y += 1) {
    for (let x = 0; x < GameState.world.mapSize; x += 1) {
      const v = data[y][x];
      if (v === '0') {
        GameState.world.fogScreen.clearPixel(x, y);
      }
    }
  }
}
