import { Cargo, GameState } from 'ludum-dare-54/game/game-state';
import { City } from 'ludum-dare-54/game/world-map';
import { Random, Rectangle, Vector2 } from 'ponczek/math';

export interface DeliveryJob {
  id: number,
  fromCity: City,
  targetCity: City,
  price: number,
  cargo: Cargo,
}

export abstract class DeliveryJobGenerator {
  static nextId: number = 0;

  static generate(amount: number, fromCity: City): DeliveryJob[] {
    const cityList = GameState.world.cities.filter((c) => c.id !== fromCity.id);
    const targetCities = Random.default.pickMany(cityList, amount, true);

    const jobs: DeliveryJob[] = [];
    for (let idx = 0; idx < targetCities.length; idx += 1) {
      const targetCity = targetCities[idx];
      const distance = Vector2.distance(fromCity.position, targetCity.position);
      const id = DeliveryJobGenerator.nextId;

      jobs.push({
        id,
        fromCity,
        targetCity,
        price: distance | 0,
        cargo: {
          parentJobId: id,
          position: new Vector2(200, 100),
          rects: [
            new Rectangle(200, 100, 50, 20),
          ],
        },
      });

      DeliveryJobGenerator.nextId += 1;
    }

    return jobs;
  }
}
