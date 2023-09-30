import { GameState } from 'ludum-dare-54/game/game-state';
import { Random } from 'ponczek/math';

export interface DeliveryJob {
  fromCityId: number,
  toCityId: number,
}

export abstract class DeliveryJobGenerator {
  static generate(amount: number, fromCityId: number): DeliveryJob[] {
    const cityList = GameState.world.cities.filter((c) => c.id !== fromCityId);
    const targetCities = Random.default.pickMany(cityList, amount, true);

    return targetCities.map((c) => ({
      fromCityId,
      toCityId: c.id,
    }));
  }
}
