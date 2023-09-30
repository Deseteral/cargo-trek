import { City } from 'ludum-dare-54/game/world-map';
import { Color, Input, Scene, SceneManager, Screen } from 'ponczek';

export class CityScene extends Scene {
  private city: City;

  constructor(city: City) {
    super();
    this.city = city;
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }
  }

  render(scr: Screen): void {
    scr.drawText(this.city.name, 10, 10, Color.white);
  }
}
