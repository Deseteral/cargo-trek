import { DeliveryJob, DeliveryJobGenerator } from 'ludum-dare-54/game/delivery-job-generator';
import { GameState } from 'ludum-dare-54/game/game-state';
import { City } from 'ludum-dare-54/game/world-map';
import { formattedCalendarTime } from 'ludum-dare-54/game/world-time';
import { CityJobMarketScene } from 'ludum-dare-54/scenes/city-job-market-scene';
import { DialogBoxScene } from 'ludum-dare-54/scenes/dialog-box-scene';
import { TalkScene } from 'ludum-dare-54/scenes/talk-scene';
import { UpgradeGarageScene } from 'ludum-dare-54/scenes/upgrade-garage-scene';
import { Color, ENDESGA16Palette, ENDESGA16PaletteIdx, GridView, Input, Random, Scene, SceneManager, Screen, SoundPlayer, Vector2 } from 'ponczek';

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
    // GameState.save();

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
      [{
        text: 'Talk to a local',
        action: () => SceneManager.pushScene(new TalkScene(this.city)),
      }],
    ];
    this.menu.cellMargin.set(1, 1);

    GameState.truck.battery = GameState.truck.batteryCapacity;

    if (!GameState.visitedCityIds.includes(city.id)) {
      GameState.visitedCityIds.push(city.id);
    }
  }

  completeJobs(): void {
    const completedJobs = GameState.activeJobs.filter((aj) => aj.job.targetCityId === this.city.id);
    const completedJobIds = completedJobs.map((aj) => aj.job.id);

    if (completedJobs.length === 0) {
      SceneManager.pushScene(new DialogBoxScene('You have nothing to deliver\n       to this city.'));
      return;
    }

    GameState.activeJobs = GameState.activeJobs.filter((aj) => aj.job.targetCityId !== this.city.id);

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

    GameState.isAdvancedPlayer = GameState.completedJobs >= 5;

    const text = [
      `Completed ${completedJobs.length} jobs for $${totalCash | 0}.`,
    ];

    if (late) {
      text.push('', 'You have received smaller payment', 'because some deliveries were late.');
    } else {
      text.push('', 'All deliveries were on time.');
    }

    SceneManager.pushScene(new DialogBoxScene(text.join('\n')));
    SoundPlayer.playSound('payment', false, 0.8);
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }

    if (Input.getKeyDown('Enter')) {
      this.menu.selectedValue.action();
    }

    if (Input.getKeyDown('KeyS') || Input.getKeyDown('ArrowDown')) {
      this.menu.selectNextRow(true);
      SoundPlayer.playSound('menu');
    }
    if (Input.getKeyDown('KeyW') || Input.getKeyDown('ArrowUp')) {
      this.menu.selectPreviousRow(true);
      SoundPlayer.playSound('menu');
    }
  }

  render(scr: Screen): void {
    scr.clearScreen(ENDESGA16Palette.darkBark);
    scr.drawText('Welcome to ', 5, 5, Color.white);
    scr.drawText(this.city.name, 5 + 'Welcome to '.length * scr.activeFont!.charWidth, 5, ENDESGA16PaletteIdx[6]);
    this.menu.drawAt(new Vector2(10, 25), scr);

    scr.drawText(`${formattedCalendarTime()}  $${GameState.cash | 0}`, 5, scr.height - 12, Color.white);
  }
}
