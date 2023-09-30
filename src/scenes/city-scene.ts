import { DeliveryJob, DeliveryJobGenerator } from 'ludum-dare-54/game/delivery-job-generator';
import { City } from 'ludum-dare-54/game/world-map';
import { CityJobMarketScene } from 'ludum-dare-54/scenes/city-job-market-scene';
import { Color, ENDESGA16Palette, GridView, Input, Random, Scene, SceneManager, Screen, Vector2 } from 'ponczek';

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

    const color = isSelected ? Color.blue : Color.white;
    scr.drawText(item.text, x, y, color);
    scr.color(color);
    scr.drawLine(x, y + 8, x + scr.activeFont!.getLineLengthPx(item.text), y + 8);
  }
}

export class CityScene extends Scene {
  city: City;
  jobs: DeliveryJob[];

  menuGridView: CityMenuGridView;
  menuGridViewPosition = new Vector2(10, 25);

  constructor(city: City) {
    super();
    this.city = city;
    this.jobs = DeliveryJobGenerator.generate(Random.default.nextInt(2, 5), city);

    this.menuGridView = new CityMenuGridView();
    this.menuGridView.cells = [
      [{
        text: 'Complete jobs',
        action: () => console.log('complete jobs'),
      }],
      [{
        text: 'See the job market',
        action: () => SceneManager.pushScene(new CityJobMarketScene(this.city, this.jobs)),
      }],
    ];
    this.menuGridView.cellMargin.set(1, 1);
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }

    if (Input.getKeyDown('Enter')) {
      this.menuGridView.selectedValue.action();
    }

    if (Input.getKeyDown('KeyS')) {
      this.menuGridView.selectNextRow(true);
    }
    if (Input.getKeyDown('KeyW')) {
      this.menuGridView.selectPreviousRow(true);
    }
  }

  render(scr: Screen): void {
    scr.clearScreen(ENDESGA16Palette.darkBark);
    scr.drawText(`Welcome to ${this.city.name}`, 10, 10, Color.white);
    this.menuGridView.drawAt(this.menuGridViewPosition, scr);
  }
}
