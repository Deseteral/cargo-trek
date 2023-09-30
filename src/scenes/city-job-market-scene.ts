import { DeliveryJob } from 'ludum-dare-54/game/delivery-job-generator';
import { GameState } from 'ludum-dare-54/game/game-state';
import { City } from 'ludum-dare-54/game/world-map';
import { Color, Screen, Input, Scene, SceneManager, ENDESGA16Palette, GridView, Vector2, ENDESGA16PaletteIdx } from 'ponczek';

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
    const color = isSelected ? ENDESGA16PaletteIdx[4] : Color.white;
    const text = `${job.targetCity.name}, $${job.price}`;

    scr.drawText(text, x, y, color);
    scr.color(color);
    if (isSelected) scr.drawLine(x, y + 8, x + scr.activeFont!.getLineLengthPx(text), y + 8);
  }
}

export class CityJobMarketScene extends Scene {
  city: City;
  menu: JobMarketMenuGridView;
  menuPosition = new Vector2(10, 10);

  constructor(city: City, jobs: DeliveryJob[]) {
    super();
    this.city = city;

    this.menu = new JobMarketMenuGridView();
    this.menu.cells = jobs.map((job) => ([{ job }]));
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }

    if (Input.getKeyDown('KeyS')) {
      this.menu.selectNextRow(true);
    }
    if (Input.getKeyDown('KeyW')) {
      this.menu.selectPreviousRow(true);
    }

    if (Input.getKeyDown('Enter')) {
      if (this.menu.cells.length > 0) {
        const idx = this.menu.cells.findIndex((row) => row[0] === this.menu.selectedValue);
        const job = this.menu.selectedValue.job;
        this.menu.cells.splice(idx, 1);
        GameState.activeJobs.push(job);
        this.menu.selectPreviousRow();
      }
    }
  }

  render(scr: Screen): void {
    scr.clearScreen(ENDESGA16Palette.darkBark);

    this.menu.drawAt(this.menuPosition, scr);

    if (this.menu.cells.length > 0) {
      // Minimap
      scr.color(ENDESGA16PaletteIdx[4]);

      const selectedJob = this.menu.selectedValue.job;
      const fromCityPos = selectedJob.fromCity.position;
      const targetCityPos = selectedJob.targetCity.position;
      const minimapX = scr.width - 10 - GameState.world.minimapSize;
      const minimapY = 10;

      scr.drawRect(minimapX - 1, minimapY - 1, GameState.world.minimapSize + 2, GameState.world.minimapSize + 2);
      scr.drawTexture(GameState.world.minimapTexture, minimapX, minimapY);

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
    } else {
      scr.drawText('Currently there are\nno delivery jobs here.', 10, 10, Color.white);
    }
  }
}