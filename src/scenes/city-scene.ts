import { DeliveryJob, DeliveryJobGenerator } from 'ludum-dare-54/game/delivery-job-generator';
import { GameState } from 'ludum-dare-54/game/game-state';
import { City } from 'ludum-dare-54/game/world-map';
import { CityJobMarketScene } from 'ludum-dare-54/scenes/city-job-market-scene';
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
    const completedJobs = GameState.activeJobs.filter((job) => job.targetCity.id === this.city.id);
    GameState.activeJobs = GameState.activeJobs.filter((job) => job.targetCity.id !== this.city.id);

    completedJobs.forEach((job) => {
      GameState.cash += job.price;
      GameState.points += job.price;
    });

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