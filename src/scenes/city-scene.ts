import { DeliveryJob, DeliveryJobGenerator } from 'ludum-dare-54/game/delivery-job-generator';
import { GameState } from 'ludum-dare-54/game/game-state';
import { City } from 'ludum-dare-54/game/world-map';
import { formattedCalendarTime } from 'ludum-dare-54/game/world-time';
import { CityJobMarketScene } from 'ludum-dare-54/scenes/city-job-market-scene';
import { DialogBoxScene } from 'ludum-dare-54/scenes/dialog-box-scene';
import { UpgradeGarageScene } from 'ludum-dare-54/scenes/upgrade-garage-scene';
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
    const text = `${isSelected ? '>' : ' '}${item.text}`;
    scr.drawText(text, x, y, color);
    scr.color(color);
    if (isSelected) scr.drawLine(x, y + 8, x + scr.activeFont!.getLineLengthPx(text), y + 8);
  }
}

export class CityScene extends Scene {
  city: City;
  jobs: DeliveryJob[];

  menu: CityMenuGridView;

  constructor(city: City) {
    super();
    this.city = city;
    this.jobs = DeliveryJobGenerator.generate(Random.default.nextInt(2, 5), city);

    this.menu = new CityMenuGridView();
    this.menu.cells = [
      [{
        text: 'Complete deliveries',
        action: () => this.completeJobs(),
      }],
      [{
        text: 'See the job market',
        action: () => SceneManager.pushScene(new CityJobMarketScene(this.city, this.jobs)),
      }],
      [{
        text: 'Drive to truck workshop',
        action: () => SceneManager.pushScene(new UpgradeGarageScene()),
      }],
    ];
    this.menu.cellMargin.set(1, 1);

    GameState.truck.battery = GameState.truck.batteryCapacity;
  }

  completeJobs(): void {
    const completedJobs = GameState.activeJobs.filter((aj) => aj.job.targetCity.id === this.city.id);
    const completedJobIds = completedJobs.map((aj) => aj.job.id);

    if (completedJobs.length === 0) {
      SceneManager.pushScene(new DialogBoxScene('You have nothing to deliver\n       to this city.'));
      return;
    }

    GameState.activeJobs = GameState.activeJobs.filter((aj) => aj.job.targetCity.id !== this.city.id);

    let totalCash = 0;
    let late = false;
    completedJobs.forEach((aj) => {
      let payment = aj.job.price;

      const timeDiff = aj.completeUntilTime - GameState.time;

      if (timeDiff < 0) {
        payment /= 2;
        late = true;
      }

      GameState.cash += payment;
      GameState.points += payment;
      totalCash += payment;
    });

    GameState.cargoStorage.cargo = GameState.cargoStorage.cargo.filter((c) => !completedJobIds.includes(c.parentJobId));

    GameState.completedJobs += completedJobs.length;

    const text = [
      `Completed ${completedJobs.length} jobs for $${totalCash}.`,
    ];

    if (late) {
      text.push('', 'You have received smaller payment', 'because some deliveries were late.');
    } else {
      text.push('', 'All deliveries were on time.');
    }

    SceneManager.pushScene(new DialogBoxScene(text.join('\n')));
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
    scr.drawText(`Welcome to ${this.city.name}!`, 5, 5, Color.white);
    this.menu.drawAt(new Vector2(10, 25), scr);

    scr.drawText(`${formattedCalendarTime()}  $${GameState.cash}`, 5, scr.height - 12, Color.white);
  }
}
