import { Cargo, GameState } from 'ludum-dare-54/game/game-state';
import { City } from 'ludum-dare-54/game/world-map';
import { Random, Rectangle, Vector2 } from 'ponczek/math';

const TIME_PER_DISTANCE = 10;

const JOB_TYPES: string[] = [
  'food',
  'supplies',
  'seeds',
  'pizza',
  'weapons',
  'radioactive materials',
  'medical supplies',
  'water',
];

export interface DeliveryJob {
  id: number,
  fromCity: City,
  targetCity: City,
  price: number,
  cargo: Cargo,
  timeToComplete: number,
  type: string,
}

export abstract class DeliveryJobGenerator {
  static nextId: number = 0;

  static generate(amount: number, fromCity: City): DeliveryJob[] {
    const cityList = GameState.world.cities
      .filter((city) => city.id !== fromCity.id)
      .map((city) => ({ distance: Vector2.sqrDistance(fromCity.position, city.position), city }))
      .sort((a, b) => a.distance - b.distance);

    const targetCities = Random.default.pickMany(GameState.isAdvancedPlayer ? cityList : cityList.slice(0, 4), amount, true).map(({ city }) => city);

    const jobs: DeliveryJob[] = [];
    for (let idx = 0; idx < targetCities.length; idx += 1) {
      const targetCity = targetCities[idx];
      const distance = Vector2.distance(fromCity.position, targetCity.position);
      const timeToComplete = distance * TIME_PER_DISTANCE;
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
        timeToComplete,
        type: Random.default.pickOne(JOB_TYPES),
      });

      DeliveryJobGenerator.nextId += 1;
    }

    return jobs;
  }
}
