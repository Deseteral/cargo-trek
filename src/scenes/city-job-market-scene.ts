import { DeliveryJob } from 'ludum-dare-54/game/delivery-job-generator';
import { City } from 'ludum-dare-54/game/world-map';
import { Color, Screen, Input, Scene, SceneManager } from 'ponczek';

export class CityJobMarketScene extends Scene {
  city: City;
  jobs: DeliveryJob[];

  constructor(city: City, jobs: DeliveryJob[]) {
    super();
    this.city = city;
    this.jobs = jobs;
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }
  }

  render(scr: Screen): void {
    for (let idx = 0; idx < this.jobs.length; idx += 1) {
      const x = 10;
      const y = 20 + idx * 10;
      const j = this.jobs[idx];

      scr.drawText(`Delivery to ${j.targetCity.name}, $${j.price}`, x, y, Color.white);
    }
  }
}
