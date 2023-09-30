import { DeliveryJob, DeliveryJobGenerator } from 'ludum-dare-54/game/delivery-job-generator';
import { City } from 'ludum-dare-54/game/world-map';
import { CityJobMarketScene } from 'ludum-dare-54/scenes/city-job-market-scene';
import { Color, Input, Scene, SceneManager, Screen } from 'ponczek';

export class CityScene extends Scene {
  city: City;
  jobs: DeliveryJob[];

  constructor(city: City) {
    super();
    this.city = city;
    this.jobs = DeliveryJobGenerator.generate(5, city);
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }

    if (Input.getKeyDown('Enter')) {
      SceneManager.pushScene(new CityJobMarketScene(this.city, this.jobs));
    }
  }

  render(scr: Screen): void {
    scr.drawText(this.city.name, 10, 10, Color.white);
  }
}
