import { DeliveryJob } from 'ludum-dare-54/game/delivery-job-generator';
import { GameState } from 'ludum-dare-54/game/game-state';
import { City } from 'ludum-dare-54/game/world-map';
import { Color, Screen, Input, Scene, SceneManager, ENDESGA16Palette, GridView, Vector2 } from 'ponczek';

interface MenuItem {
  job: DeliveryJob,
}

class JobMarketMenuGridView extends GridView<MenuItem> {
  constructor() {
    super(200, 12);
  }

  public drawCell(item: (MenuItem | null), _row: number, _column: number, x: number, y: number, isSelected: boolean, scr: Screen): void {
    if (!item) return;

    const job = item.job;
    const color = isSelected ? Color.blue : Color.white;
    const text = `${job.targetCity.name}, $${job.price}`;

    scr.drawText(text, x, y, color);
    scr.color(color);
    if (isSelected) scr.drawLine(x, y + 8, x + scr.activeFont!.getLineLengthPx(text), y + 8);
  }
}

export class CityJobMarketScene extends Scene {
  city: City;
  jobMarketMenuGridView: JobMarketMenuGridView;
  jobMarketMenuGridViewPostion = new Vector2(10, 10);

  constructor(city: City, jobs: DeliveryJob[]) {
    super();
    this.city = city;

    this.jobMarketMenuGridView = new JobMarketMenuGridView();
    this.jobMarketMenuGridView.cells = jobs.map((job) => ([{ job }]));
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }

    if (Input.getKeyDown('KeyS')) {
      this.jobMarketMenuGridView.selectNextRow(true);
    }
    if (Input.getKeyDown('KeyW')) {
      this.jobMarketMenuGridView.selectPreviousRow(true);
    }
  }

  render(scr: Screen): void {
    scr.clearScreen(ENDESGA16Palette.darkBark);

    this.jobMarketMenuGridView.drawAt(this.jobMarketMenuGridViewPostion, scr);

    // Minimap
    const selectedJob = this.jobMarketMenuGridView.selectedValue.job;
    const fromCityPos = selectedJob.fromCity.position;
    const targetCityPos = selectedJob.targetCity.position;
    const minimapX = scr.width - 10 - GameState.world.minimapSize;
    const minimapY = 10;

    scr.drawTexture(GameState.world.minimapTexture, minimapX, minimapY);

    scr.color(Color.blue);

    scr.drawRect(
      minimapX + (fromCityPos.x / GameState.world.minimapScale) - 2,
      minimapY + (fromCityPos.y / GameState.world.minimapScale) - 2,
      5,
      5,
    );

    scr.drawRect(
      minimapX + (targetCityPos.x / GameState.world.minimapScale) - 2,
      minimapY + (targetCityPos.y / GameState.world.minimapScale) - 2,
      5,
      5,
    );
  }
}
