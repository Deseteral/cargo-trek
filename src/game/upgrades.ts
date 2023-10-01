import { Rectangle } from 'ponczek';

export interface Upgrades {
  cargoLevel: number,
  terrainPack: boolean,
  speedBoost: boolean,
  batteryLevel: number,
  highEfficiency: boolean,
}

export function getCargoStorageForLevel(level: number): Rectangle {
  return new Rectangle(10, 100, 30, 30);
}

export const UPGRADE_PRICES = {
  cargoLevel: [500, 2500, 7000, 15500, 20000],
  terrainPack: 800,
  speedBoost: 300,
  batteryLevel: [200, 400, 550, 625],
  highEfficiency: 100,
} as const;
