import { DeliveryJob } from 'ludum-dare-54/game/delivery-job-generator';
import { GameState } from 'ludum-dare-54/game/game-state';
import { City } from 'ludum-dare-54/game/world-map';
import { CargoScene } from 'ludum-dare-54/scenes/cargo-scene';
import { Color, Screen, Input, Scene, SceneManager, ENDESGA16Palette, GridView, Vector2, ENDESGA16PaletteIdx, Ponczek, SoundPlayer } from 'ponczek';

interface MenuItem {
  job: DeliveryJob,
}

class JobMarketMenuGridView extends GridView<MenuItem> {
  constructor() {
    super(Ponczek.screen.width, 12);
  }

  public drawCell(item: (MenuItem | null), _row: number, _column: number, x: number, y: number, isSelected: boolean, scr: Screen): void {
    if (!item) return;

    const job = item.job;
    const color = isSelected ? ENDESGA16PaletteIdx[4] : Color.white;
    const targetCity = GameState.world.cities.find((c) => c.id === job.targetCityId)!;
    const text = `${job.type.capitalize()} to ${targetCity.name}, $${job.price}`;

    scr.drawText(text, x, y, color);
    scr.color(color);
    if (isSelected) scr.drawLine(x, y + 8, x + scr.activeFont!.getLineLengthPx(text), y + 8);
  }
}

export class CityJobMarketScene extends Scene {
  city: City;
  menu: JobMarketMenuGridView;

  constructor(city: City, jobs: DeliveryJob[]) {
    super();
    this.city = city;

    this.menu = new JobMarketMenuGridView();
    this.menu.cells = jobs.map((job) => ([{ job }]));
  }

  update(): void {
    if (CargoScene.exitedWithSuccess) {
      // Remove picked job from menu
      const job = this.menu.selectedValue.job;
      const idx = this.menu.cells.findIndex((row) => row[0] === this.menu.selectedValue);
      this.menu.cells.splice(idx, 1);
      this.menu.selectPreviousRow();

      GameState.activeJobs.push({
        job,
        completeUntilTime: GameState.time + job.timeToComplete,
      });

      CargoScene.exitedWithSuccess = false;
    }

    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }

    if (Input.getKeyDown('KeyS')) {
      this.menu.selectNextRow(true);
      SoundPlayer.playSound('menu');
    }
    if (Input.getKeyDown('KeyW')) {
      this.menu.selectPreviousRow(true);
      SoundPlayer.playSound('menu');
    }

    if (Input.getKeyDown('Enter') && this.menu.cells.length > 0) {
      const job = this.menu.selectedValue.job;
      SceneManager.pushScene(new CargoScene(job.cargo));
    }
  }

  render(scr: Screen): void {
    scr.clearScreen(ENDESGA16Palette.darkBark);

    this.menu.drawAt(new Vector2(5, 5), scr);

    if (this.menu.cells.length > 0) {
      // Minimap
      scr.color(ENDESGA16PaletteIdx[4]);

      const selectedJob = this.menu.selectedValue.job;
      const fromCity = GameState.world.cities.find((c) => c.id === selectedJob.fromCityId)!;
      const targetCity = GameState.world.cities.find((c) => c.id === selectedJob.targetCityId)!;

      const fromCityPos = fromCity.position;
      const targetCityPos = targetCity.position;
      const minimapX = 5;
      const minimapY = scr.height - 5 - GameState.world.minimapSize;

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
