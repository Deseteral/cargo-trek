import { ActiveJob, GameState } from 'ludum-dare-54/game/game-state';
import { UPGRADE_PRICES } from 'ludum-dare-54/game/upgrades';
import { formattedCalendarTime, formattedDurationTime } from 'ludum-dare-54/game/world-time';
import { DialogBoxScene } from 'ludum-dare-54/scenes/dialog-box-scene';
import { OverworldScene } from 'ludum-dare-54/scenes/overworld-scene';
import { Color, Datastore, ENDESGA16PaletteIdx, GridView, Input, Scene, SceneManager, Screen, SoundPlayer, Vector2 } from 'ponczek';

interface MenuItem {
  text: string,
  action: () => void,
}

class OverworldPauseMenuGridView extends GridView<MenuItem> {
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

class ActiveJobsMenuGridView extends GridView<ActiveJob> {
  constructor() {
    super(200, 12);
  }

  public drawCell(item: (ActiveJob | null), _row: number, _column: number, x: number, y: number, isSelected: boolean, scr: Screen): void {
    if (!item) return;

    const job = item.job;
    const color = isSelected ? ENDESGA16PaletteIdx[4] : Color.white;
    const targetCity = GameState.world.cities.find((c) => c.id === job.targetCityId)!;
    const text = `${isSelected ? '>' : ' '}${targetCity.name}`;

    scr.drawText(text, x, y, color);
    scr.color(color);
    if (isSelected) scr.drawLine(x, y + 8, x + scr.activeFont!.getLineLengthPx(text), y + 8);
  }
}

type SelectedMenu = 'menu' | 'activeJobs' | 'truckUpgrades';

export class OverworldPauseScene extends Scene {
  menu: OverworldPauseMenuGridView;
  activeJobsMenu: ActiveJobsMenuGridView;

  selectedMenu: SelectedMenu = 'menu';

  parent: OverworldScene;

  constructor(parent: OverworldScene) {
    super();

    this.parent = parent;

    this.menu = new OverworldPauseMenuGridView();
    this.menu.cells = [
      [{
        text: 'Active jobs',
        action: () => {
          this.selectedMenu = 'activeJobs';
        },
      }],
      [{
        text: 'Truck upgrades',
        action: () => {
          this.selectedMenu = 'truckUpgrades';
        },
      }],
      [null],
      [{
        text: 'Save game',
        action: () => {
          GameState.save();
          SceneManager.pushScene(new DialogBoxScene('Game saved!'));
        },
      }],
      [{
        text: 'Load game',
        action: () => {
          if (!Datastore.exists()) {
            SceneManager.pushScene(new DialogBoxScene('There is no saved game.'));
            return;
          }
          GameState.load();
          parent.lookAtTruck();
          SceneManager.pushScene(new DialogBoxScene('Game loaded!'));
        },
      }],
    ];

    this.activeJobsMenu = new ActiveJobsMenuGridView();
    this.activeJobsMenu.cells = GameState.activeJobs.map((aj) => ([aj]));
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      if (this.selectedMenu === 'menu') {
        SceneManager.popScene();
      } else if (this.selectedMenu === 'activeJobs') {
        this.selectedMenu = 'menu';
      } else if (this.selectedMenu === 'truckUpgrades') {
        this.selectedMenu = 'menu';
      }
    }

    if (Input.getKeyDown('KeyS')) {
      if (this.selectedMenu === 'menu') {
        this.menu.selectNextRow(true);
        SoundPlayer.playSound('menu');
      } else if (this.selectedMenu === 'activeJobs' && GameState.activeJobs.length > 0) {
        this.activeJobsMenu.selectNextRow(true);
        SoundPlayer.playSound('menu');
      }
    }

    if (Input.getKeyDown('KeyW')) {
      if (this.selectedMenu === 'menu') {
        this.menu.selectPreviousRow(true);
        SoundPlayer.playSound('menu');
      } else if (this.selectedMenu === 'activeJobs' && GameState.activeJobs.length > 0) {
        this.activeJobsMenu.selectPreviousRow(true);
        SoundPlayer.playSound('menu');
      }
    }

    if (Input.getKeyDown('Enter')) {
      if (this.selectedMenu === 'menu') {
        this.menu.selectedValue.action();
      } else if (this.selectedMenu === 'activeJobs') {
        this.showJobDetails();
      }
    }
  }

  showJobDetails(): void {
    if (GameState.activeJobs.length <= 0) return;

    const aj = this.activeJobsMenu.selectedValue;
    const timeDiff = aj.completeUntilTime - GameState.time;
    const targetCity = GameState.world.cities.find((c) => c.id === aj.job.targetCityId)!;
    const text = [
      `${aj.job.type.capitalize()} to ${targetCity.name}`,
      `Payment: $${aj.job.price}`,
      '',
      timeDiff <= 0 ? 'Delayed shipment' : `Time left: ${formattedDurationTime(timeDiff)}`,
    ].join('\n');
    SceneManager.pushScene(new DialogBoxScene(text));
  }

  render(scr: Screen): void {
    // Background frame
    scr.color(ENDESGA16PaletteIdx[3]);
    scr.fillRect(0, 0, 200, scr.height);

    scr.color(ENDESGA16PaletteIdx[6]);
    scr.drawLine(200, 0, 200, scr.height);

    if (this.selectedMenu === 'menu') {
      // Date time, cash
      scr.drawText(formattedCalendarTime(), 1, 3, Color.white);
      scr.drawText(`$${GameState.cash | 0}`, 1, 12, Color.white);

      // Menu
      this.menu.drawAt(new Vector2(5, 38), scr);

      // Odometer
      scr.drawText(`Distance driven: ${GameState.distanceDriven | 0} km`, 1, scr.height - 10, Color.white);
    }

    if (this.selectedMenu === 'activeJobs') {
      scr.drawText('Active jobs', 1, 5, ENDESGA16PaletteIdx[6]);

      if (GameState.activeJobs.length > 0) {
        this.activeJobsMenu.drawAt(new Vector2(5, 20), scr);
      } else {
        scr.drawText('Currently you have no\nactive jobs', 5, 20, Color.white);
      }
    }

    if (this.selectedMenu === 'truckUpgrades') {
      const lineHeight = 10;
      const x = 1;
      let y = 5;

      scr.drawText('Truck upgrades', x, y, ENDESGA16PaletteIdx[6]);
      y += 20;

      scr.drawText('Cargo hold level', x, y, Color.white);
      y += lineHeight;
      scr.drawText(`${GameState.upgrades.cargoLevel}/${UPGRADE_PRICES.cargoLevel.length}`, x + 5, y, ENDESGA16PaletteIdx[12]);
      y += lineHeight;
      y += lineHeight;

      scr.drawText('Battery capacity', x, y, Color.white);
      y += lineHeight;
      scr.drawText(`${GameState.truck.batteryCapacity} kWh`, x + 5, y, ENDESGA16PaletteIdx[12]);
      y += lineHeight;
      y += lineHeight;

      scr.drawText('Rough terrain pack', x, y, Color.white);
      y += lineHeight;
      scr.drawText(GameState.upgrades.terrainPack ? 'installed' : 'not installed', x + 5, y, ENDESGA16PaletteIdx[GameState.upgrades.terrainPack ? 9 : 12]);
      y += lineHeight;
      y += lineHeight;

      scr.drawText('Speed boost', x, y, Color.white);
      y += lineHeight;
      scr.drawText(GameState.upgrades.speedBoost ? 'installed' : 'not installed', x + 5, y, ENDESGA16PaletteIdx[GameState.upgrades.speedBoost ? 9 : 12]);
      y += lineHeight;
      y += lineHeight;

      scr.drawText('High efficiency motors', x, y, Color.white);
      y += lineHeight;
      scr.drawText(GameState.upgrades.highEfficiency ? 'installed' : 'not installed', x + 5, y, ENDESGA16PaletteIdx[GameState.upgrades.highEfficiency ? 9 : 12]);
      y += lineHeight;
      y += lineHeight;

      scr.drawText('High voltage charging', x, y, Color.white);
      y += lineHeight;
      scr.drawText(GameState.upgrades.fastCharging ? 'installed' : 'not installed', x + 5, y, ENDESGA16PaletteIdx[GameState.upgrades.fastCharging ? 9 : 12]);
      y += lineHeight;
      y += lineHeight;

      scr.drawText('GPS navigation', x, y, Color.white);
      y += lineHeight;
      scr.drawText(GameState.upgrades.gps ? 'installed' : 'not installed', x + 5, y, ENDESGA16PaletteIdx[GameState.upgrades.gps ? 9 : 12]);
      y += lineHeight;
      y += lineHeight;
    }

    // Minimap
    {
      if (GameState.upgrades.gps || (this.selectedMenu === 'activeJobs' && GameState.activeJobs.length > 0)) {
        const minimapX = scr.width - 5 - GameState.world.minimapSize;
        const minimapY = ((scr.height - GameState.world.minimapSize) / 2) | 0;

        scr.color(ENDESGA16PaletteIdx[6]);
        scr.drawRect(minimapX - 1, minimapY - 1, GameState.world.minimapSize + 2, GameState.world.minimapSize + 2);
        scr.drawTexture(GameState.world.minimapTexture, minimapX, minimapY);

        if (GameState.upgrades.gps) {
          scr.color(Color.white);
          scr.drawLine(minimapX + (GameState.truck.position.x / GameState.world.minimapScale) - 1, minimapY + (GameState.truck.position.y / GameState.world.minimapScale) - 1, minimapX + (GameState.truck.position.x / GameState.world.minimapScale) + 1, minimapY + (GameState.truck.position.y / GameState.world.minimapScale) + 1);
          scr.drawLine(minimapX + (GameState.truck.position.x / GameState.world.minimapScale) + 1, minimapY + (GameState.truck.position.y / GameState.world.minimapScale) - 1, minimapX + (GameState.truck.position.x / GameState.world.minimapScale) - 1, minimapY + (GameState.truck.position.y / GameState.world.minimapScale) + 1);
        }

        if (this.selectedMenu === 'activeJobs' && GameState.activeJobs.length > 0) {
          const selectedJob = this.activeJobsMenu.selectedValue.job;
          const targetCity = GameState.world.cities.find((c) => c.id === selectedJob.targetCityId)!;
          const targetCityPos = targetCity.position;

          scr.color(ENDESGA16PaletteIdx[4]);
          scr.drawRect(
            minimapX + (targetCityPos.x / GameState.world.minimapScale) - 2,
            minimapY + (targetCityPos.y / GameState.world.minimapScale) - 2,
            5,
            5,
          );
        }
      }
    }
  }
}
