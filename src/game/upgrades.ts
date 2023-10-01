import { Rectangle } from 'ponczek';

export interface Upgrades {
  cargoLevel: number,
  terrainPack: boolean,
  speedBoost: boolean,
  batteryLevel: number,
  highEfficiency: boolean,
  fastCharging: boolean,
  gps: boolean,
}

export function getCargoStorageForLevel(level: number): Rectangle {
  if (level === -1) {
    return new Rectangle(10, 100, 30, 30);
  }

  if (level === 0) {
    return new Rectangle(10, 80, 35, 70);
  }

  if (level === 1) {
    return new Rectangle(10, 80, 50, 85);
  }

  if (level === 2) {
    return new Rectangle(10, 80, 80, 90);
  }

  if (level === 3) {
    return new Rectangle(10, 50, 100, 140);
  }

  if (level === 4) {
    return new Rectangle(10, 25, 120, 200);
  }

  throw new Error('what?');
}

export const UPGRADE_PRICES = {
  cargoLevel: [500, 2500, 7000, 15500, 20000],
  terrainPack: 800,
  speedBoost: 300,
  batteryLevel: [200, 400, 550, 625, 680, 725, 790, 810, 870, 900, 960, 1060],
  highEfficiency: 100,
  fastCharging: 500,
  gps: 500,
} as const;
