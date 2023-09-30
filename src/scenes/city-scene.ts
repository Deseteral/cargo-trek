import { DeliveryJob, DeliveryJobGenerator } from 'ludum-dare-54/game/delivery-job-generator';
import { City } from 'ludum-dare-54/game/world-map';
import { Color, Input, Scene, SceneManager, Screen } from 'ponczek';

export class CityScene extends Scene {
  city: City;
  jobs: DeliveryJob[];

  constructor(city: City) {
    super();
    this.city = city;
    this.jobs = DeliveryJobGenerator.generate(5, city.id);
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }
  }

  render(scr: Screen): void {
    scr.drawText(this.city.name, 10, 10, Color.white);

    for (let idx = 0; idx < this.jobs.length; idx += 1) {
      const x = 10;
      const y = 20 + idx * 10;
      const j = this.jobs[idx];

      scr.drawText(`${j.fromCityId} ${j.toCityId}`, x, y, Color.white);
    }
  }
}
