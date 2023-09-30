import { DeliveryJob } from 'ludum-dare-54/game/delivery-job-generator';
import { Truck } from 'ludum-dare-54/game/truck';
import { WorldMap } from 'ludum-dare-54/game/world-map';

export class GameState {
  static seed: number;
  static world: WorldMap;
  static truck: Truck;
  static activeJobs: DeliveryJob[];
  static cash: number;
  static points: number;

  static create(seed: number): void {
    GameState.seed = seed;

    GameState.world = new WorldMap(400, seed);
    GameState.world.generate();

    const firstCityPos = GameState.world.cities[0].position.copy();
    GameState.truck = new Truck(firstCityPos);

    GameState.activeJobs = [];

    GameState.cash = 0;
    GameState.points = 0;
  }
}
