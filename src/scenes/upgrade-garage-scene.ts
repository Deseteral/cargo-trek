import { GameState } from 'ludum-dare-54/game/game-state';
import { UPGRADE_PRICES, getCargoStorageForLevel } from 'ludum-dare-54/game/upgrades';
import { DialogBoxScene } from 'ludum-dare-54/scenes/dialog-box-scene';
import { Color, ENDESGA16Palette, ENDESGA16PaletteIdx, GridView, Input, Ponczek, Scene, SceneManager, Screen, SoundPlayer, Vector2 } from 'ponczek';

// TODO: This could land in Ponczek utils.
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

interface MenuItem {
  text: string,
  description: string,
  action: () => void,
}

class UpgradeGarageMenuGridView extends GridView<MenuItem> {
  constructor() {
    super(Ponczek.screen.width, 12);
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

export class UpgradeGarageScene extends Scene {
  menu: UpgradeGarageMenuGridView;

  constructor() {
    super();
    this.menu = new UpgradeGarageMenuGridView();
    this.menu.withCellClipping = false;
    this.menu.cells = this.getCells();
  }

  private getCells(): MenuItem[][] {
    return [
      GameState.upgrades.cargoLevel < UPGRADE_PRICES.cargoLevel.length ? [{
        text: `Level ${GameState.upgrades.cargoLevel + 1} cargo hold upgrade ($${UPGRADE_PRICES.cargoLevel[GameState.upgrades.cargoLevel]})`,
        description: 'Larger cargo hold for your truck.',
        action: () => {
          const price = UPGRADE_PRICES.cargoLevel[GameState.upgrades.cargoLevel];
          if (GameState.cash < price) {
            SceneManager.pushScene(new DialogBoxScene("You don't have enough money."));
            return;
          }

          GameState.cargoStorage.bounds = getCargoStorageForLevel(GameState.upgrades.cargoLevel);
          GameState.cash -= price;
          GameState.upgrades.cargoLevel += 1;

          SceneManager.pushScene(new DialogBoxScene(`You've purchased\n${this.menu.selectedValue.text}`));
          this.menu.cells = this.getCells();
          this.scrollToFirstItem();
        },
      }] : null,
      !GameState.upgrades.terrainPack ? [{
        text: `Rough terrain pack ($${UPGRADE_PRICES.terrainPack})`,
        description: 'Allows you to drive faster on\nsteeper terrain.',
        action: () => {
          const price = UPGRADE_PRICES.terrainPack;
          if (GameState.cash < price) {
            SceneManager.pushScene(new DialogBoxScene("You don't have enough money."));
            return;
          }

          GameState.upgrades.terrainPack = true;
          GameState.cash -= UPGRADE_PRICES.terrainPack;

          SceneManager.pushScene(new DialogBoxScene(`You've purchased\n${this.menu.selectedValue.text}`));
          this.menu.cells = this.getCells();
          this.scrollToFirstItem();
        },
      }] : null,
      !GameState.upgrades.speedBoost ? [{
        text: `Speed boost ($${UPGRADE_PRICES.speedBoost})`,
        description: 'High power motors for your truck.',
        action: () => {
          const price = UPGRADE_PRICES.speedBoost;
          if (GameState.cash < price) {
            SceneManager.pushScene(new DialogBoxScene("You don't have enough money."));
            return;
          }

          GameState.upgrades.speedBoost = true;
          GameState.cash -= price;

          SceneManager.pushScene(new DialogBoxScene(`You've purchased\n${this.menu.selectedValue.text}`));
          this.menu.cells = this.getCells();
          this.scrollToFirstItem();
        },
      }] : null,
      GameState.upgrades.batteryLevel < UPGRADE_PRICES.batteryLevel.length ? [{
        text: `+25 kWh battery ($${UPGRADE_PRICES.batteryLevel[GameState.upgrades.batteryLevel]})`,
        description: 'Additional battery pack installed\non the truck.',
        action: () => {
          const price = UPGRADE_PRICES.batteryLevel[GameState.upgrades.batteryLevel];
          if (GameState.cash < price) {
            SceneManager.pushScene(new DialogBoxScene("You don't have enough money."));
            return;
          }

          GameState.upgrades.batteryLevel += 1;
          GameState.truck.battery += 25;
          GameState.truck.batteryCapacity += 25;
          GameState.cash -= price;

          SceneManager.pushScene(new DialogBoxScene(`You've purchased\n${this.menu.selectedValue.text}`));
          this.menu.cells = this.getCells();
          this.scrollToFirstItem();
        },
      }] : null,
      !GameState.upgrades.highEfficiency ? [{
        text: `High efficiency motors ($${UPGRADE_PRICES.highEfficiency})`,
        description: 'More efficient motors will use\nless energy when driving.',
        action: () => {
          const price = UPGRADE_PRICES.highEfficiency;
          if (GameState.cash < price) {
            SceneManager.pushScene(new DialogBoxScene("You don't have enough money."));
            return;
          }

          GameState.upgrades.highEfficiency = true;
          GameState.cash -= price;

          SceneManager.pushScene(new DialogBoxScene(`You've purchased\n${this.menu.selectedValue.text}`));
          this.menu.cells = this.getCells();
          this.scrollToFirstItem();
        },
      }] : null,
      !GameState.upgrades.fastCharging ? [{
        text: `High voltage charging system ($${UPGRADE_PRICES.fastCharging})`,
        description: 'Higher voltage architecture allows\nfor faster charging speeds.',
        action: () => {
          const price = UPGRADE_PRICES.fastCharging;
          if (GameState.cash < price) {
            SceneManager.pushScene(new DialogBoxScene("You don't have enough money."));
            return;
          }

          GameState.upgrades.fastCharging = true;
          GameState.cash -= price;

          SceneManager.pushScene(new DialogBoxScene(`You've purchased\n${this.menu.selectedValue.text}`));
          this.menu.cells = this.getCells();
          this.scrollToFirstItem();
        },
      }] : null,
      !GameState.upgrades.gps ? [{
        text: `GPS navigation ($${UPGRADE_PRICES.gps})`,
        description: 'Shows your position on the map.',
        action: () => {
          const price = UPGRADE_PRICES.gps;
          if (GameState.cash < price) {
            SceneManager.pushScene(new DialogBoxScene("You don't have enough money."));
            return;
          }

          GameState.upgrades.gps = true;
          GameState.cash -= price;

          SceneManager.pushScene(new DialogBoxScene(`You've purchased\n${this.menu.selectedValue.text}`));
          this.menu.cells = this.getCells();
          this.scrollToFirstItem();
        },
      }] : null,
    ].filter(notEmpty);
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }

    if (this.menu.cells.length > 0) {
      if (Input.getKeyDown('KeyS')) {
        this.menu.selectNextRow(true);
        SoundPlayer.playSound('menu');
      }
      if (Input.getKeyDown('KeyW')) {
        this.menu.selectPreviousRow(true);
        SoundPlayer.playSound('menu');
      }

      if (Input.getKeyDown('Enter')) {
        this.menu.selectedValue.action();
      }
    }
  }

  // TODO: Ponczek API should have this
  scrollToFirstItem(): void {
    for (let i = 0; i < 10; i += 1) {
      this.menu.selectPreviousRow();
    }
  }

  render(scr: Screen): void {
    scr.clearScreen(ENDESGA16Palette.darkBark);
    scr.drawText('Welcome to McMechaniol\'s Garage!', 0, 3, ENDESGA16PaletteIdx[6]);

    if (this.menu.cells.length > 0) {
      scr.drawText('What would you like to see installed?', 8, 20, Color.white);
      this.menu.drawAt(new Vector2(8, 32), scr);

      scr.drawText(this.menu.selectedValue.description, 10, 130, ENDESGA16PaletteIdx[12]);
    } else {
      scr.drawText('Your truck has all upgrades installed.', 8, 20, Color.white);
    }

    scr.drawText(`$${GameState.cash | 0}`, 5, scr.height - 12, Color.white);
  }
}
