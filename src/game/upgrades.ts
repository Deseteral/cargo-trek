import { Rectangle } from 'ponczek';

export interface Upgrades {
  cargoLevel: number,
  terrainPack: boolean,
  speedBoost: boolean,
  batteryLevel: number,
  highEfficiency: boolean,
  fastCharging: boolean,
}

export function getCargoStorageForLevel(level: number): Rectangle {
  return new Rectangle(10, 100, 30, 30); // this is for -1, starting bounds
}

export const UPGRADE_PRICES = {
  cargoLevel: [500, 2500, 7000, 15500, 20000],
  terrainPack: 800,
  speedBoost: 300,
  batteryLevel: [200, 400, 550, 625, 680, 725, 790, 810, 870, 900, 960, 1060],
  highEfficiency: 100,
  fastCharging: 500,
} as const;
