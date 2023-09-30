import { DeliveryJob } from 'ludum-dare-54/game/delivery-job-generator';
import { Truck } from 'ludum-dare-54/game/truck';
import { WorldMap } from 'ludum-dare-54/game/world-map';
import { Rectangle, Vector2 } from 'ponczek';

export interface CargoStorage {
  bounds: Rectangle,
  cargo: Cargo[],
}

export interface Cargo {
  position: Vector2,
  rects: Rectangle[],
}

export class GameState {
  static seed: number;
  static world: WorldMap;
  static truck: Truck;
  static activeJobs: DeliveryJob[];
  static cash: number;
  static points: number;
  static cargoStorage: CargoStorage;

  static create(seed: number): void {
    GameState.seed = seed;

    GameState.world = new WorldMap(400, seed);
    GameState.world.generate();

    const firstCityPos = GameState.world.cities[0].position.copy();
    GameState.truck = new Truck(firstCityPos);

    GameState.activeJobs = [];

    GameState.cash = 0;
    GameState.points = 0;

    GameState.cargoStorage = {
      bounds: new Rectangle(10, 10, 100, 200),
      cargo: [
        { position: Vector2.zero(), rects: [new Rectangle(0, 0, 10, 10)] },
        { position: Vector2.zero(), rects: [new Rectangle(0, 0, 10, 10), new Rectangle(10, 0, 10, 10), new Rectangle(0, 10, 10, 10)] },
        { position: Vector2.zero(), rects: [new Rectangle(0, 0, 50, 50)] },
      ],
    };
  }
}
