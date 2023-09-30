import { GameState } from 'ludum-dare-54/game/game-state';
import { City } from 'ludum-dare-54/game/world-map';
import { Random, Vector2 } from 'ponczek/math';

export interface DeliveryJob {
  fromCity: City,
  targetCity: City,
  price: number,
}

export abstract class DeliveryJobGenerator {
  static generate(amount: number, fromCity: City): DeliveryJob[] {
    const cityList = GameState.world.cities.filter((c) => c.id !== fromCity.id);
    const targetCities = Random.default.pickMany(cityList, amount, true);

    const jobs: DeliveryJob[] = [];
    for (let idx = 0; idx < targetCities.length; idx += 1) {
      const targetCity = targetCities[idx];
      const distance = Vector2.distance(fromCity.position, targetCity.position);

      jobs.push({
        fromCity,
        targetCity,
        price: distance | 0,
      });
    }

    return jobs;
  }
}
