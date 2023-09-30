import { DeliveryJob, DeliveryJobGenerator } from 'ludum-dare-54/game/delivery-job-generator';
import { GameState } from 'ludum-dare-54/game/game-state';
import { City } from 'ludum-dare-54/game/world-map';
import { CityJobMarketScene } from 'ludum-dare-54/scenes/city-job-market-scene';
import { DialogBoxScene } from 'ludum-dare-54/scenes/dialog-box-scene';
import { Color, ENDESGA16Palette, ENDESGA16PaletteIdx, GridView, Input, Random, Scene, SceneManager, Screen, Vector2 } from 'ponczek';

interface MenuItem {
  text: string,
  action: () => void,
}

class CityMenuGridView extends GridView<MenuItem> {
  constructor() {
    super(200, 12);
  }

  public drawCell(item: (MenuItem | null), _row: number, _column: number, x: number, y: number, isSelected: boolean, scr: Screen): void {
    if (!item) return;

    const color = isSelected ? ENDESGA16PaletteIdx[4] : Color.white;
    scr.drawText(item.text, x, y, color);
    scr.color(color);
    if (isSelected) scr.drawLine(x, y + 8, x + scr.activeFont!.getLineLengthPx(item.text), y + 8);
  }
}

export class CityScene extends Scene {
  city: City;
  jobs: DeliveryJob[];

  menu: CityMenuGridView;
  menuPosition = new Vector2(15, 25);

  constructor(city: City) {
    super();
    this.city = city;
    this.jobs = DeliveryJobGenerator.generate(Random.default.nextInt(2, 5), city);

    this.menu = new CityMenuGridView();
    this.menu.cells = [
      [{
        text: 'Complete jobs',
        action: () => this.completeJobs(),
      }],
      [{
        text: 'See the job market',
        action: () => SceneManager.pushScene(new CityJobMarketScene(this.city, this.jobs)),
      }],
    ];
    this.menu.cellMargin.set(1, 1);
  }

  completeJobs(): void {
    const completedJobs = GameState.activeJobs.filter((aj) => aj.job.targetCity.id === this.city.id);
    const completedJobIds = completedJobs.map((aj) => aj.job.id);

    if (completedJobs.length === 0) {
      SceneManager.pushScene(new DialogBoxScene('You have nothing to deliver to this city'));
      return;
    }

    GameState.activeJobs = GameState.activeJobs.filter((aj) => aj.job.targetCity.id !== this.city.id);

    let totalCash = 0;
    completedJobs.forEach((aj) => {
      GameState.cash += aj.job.price;
      GameState.points += aj.job.price;
      totalCash += aj.job.price;
    });

    GameState.cargoStorage.cargo = GameState.cargoStorage.cargo.filter((c) => !completedJobIds.includes(c.parentJobId));

    SceneManager.pushScene(new DialogBoxScene(`Completed ${completedJobs.length} jobs for $${totalCash}.`));

    console.log('Completed jobs', completedJobs);
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }

    if (Input.getKeyDown('Enter')) {
      this.menu.selectedValue.action();
    }

    if (Input.getKeyDown('KeyS')) {
      this.menu.selectNextRow(true);
    }
    if (Input.getKeyDown('KeyW')) {
      this.menu.selectPreviousRow(true);
    }
  }

  render(scr: Screen): void {
    scr.clearScreen(ENDESGA16Palette.darkBark);
    scr.drawText(`Welcome to ${this.city.name}!`, 10, 10, Color.white);
    this.menu.drawAt(this.menuPosition, scr);
  }
}
