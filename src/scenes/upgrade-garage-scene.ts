import { Color, ENDESGA16Palette, ENDESGA16PaletteIdx, GridView, Input, Ponczek, Scene, SceneManager, Screen, Vector2 } from 'ponczek';

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
    this.menu.cells = [
      [{ text: 'Level 1 cargo hold upgrade' }],
      [{ text: 'Rough terrain pack' }],
      [{ text: 'Speed boost' }],
      [{ text: '100 kWh battery' }],
      [{ text: 'High efficiency motors' }],
    ];
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
  }

  render(scr: Screen): void {
    scr.clearScreen(ENDESGA16Palette.darkBark);
    scr.drawText('Welcome to McMechaniol\'s Garage!', 0, 3, ENDESGA16PaletteIdx[6]);
    scr.drawText('What would you like to be installed?', 8, 20, Color.white);
    this.menu.drawAt(new Vector2(8, 32), scr);
  }
}
