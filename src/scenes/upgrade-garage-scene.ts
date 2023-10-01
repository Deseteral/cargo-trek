import { GameState } from 'ludum-dare-54/game/game-state';
import { UPGRADE_PRICES } from 'ludum-dare-54/game/upgrades';
import { DialogBoxScene } from 'ludum-dare-54/scenes/dialog-box-scene';
import { Color, ENDESGA16Palette, ENDESGA16PaletteIdx, GridView, Input, Ponczek, Scene, SceneManager, Screen, Vector2 } from 'ponczek';

// TODO: This could land in Ponczek utils.
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

interface MenuItem {
  text: string,
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
    this.menu.cells = this.getCells();
  }

  private getCells(): MenuItem[][] {
    return [
      GameState.upgrades.cargoLevel <= 5 ? [{ text: `Level ${GameState.upgrades.cargoLevel + 1} cargo hold upgrade ($${UPGRADE_PRICES.cargoLevel[GameState.upgrades.cargoLevel]})` }] : null,
      !GameState.upgrades.terrainPack ? [{ text: `Rough terrain pack ($${UPGRADE_PRICES.terrainPack})` }] : null,
      !GameState.upgrades.speedBoost ? [{ text: `Speed boost ($${UPGRADE_PRICES.speedBoost})` }] : null,
      GameState.upgrades.batteryLevel <= 4 ? [{ text: `+25 kWh battery ($${UPGRADE_PRICES.batteryLevel[GameState.upgrades.batteryLevel]})` }] : null,
      !GameState.upgrades.highEfficiency ? [{ text: `High efficiency motors ($${UPGRADE_PRICES.highEfficiency})` }] : null,
    ].filter(notEmpty);
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
      SceneManager.pushScene(new DialogBoxScene(`You've purchased\n${this.menu.selectedValue.text}`));

      this.menu.cells = this.getCells();

      // Scroll to item number 1
      for (let i = 0; i < 10; i += 1) {
        this.menu.selectPreviousRow();
      }
    }
  }

  render(scr: Screen): void {
    scr.clearScreen(ENDESGA16Palette.darkBark);
    scr.drawText('Welcome to McMechaniol\'s Garage!', 0, 3, ENDESGA16PaletteIdx[6]);
    scr.drawText('What would you like to see installed?', 8, 20, Color.white);
    this.menu.drawAt(new Vector2(8, 32), scr);
  }
}
