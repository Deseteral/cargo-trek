import { ENDESGA16PaletteIdx, Input, Scene, SceneManager, Screen } from 'ponczek';

export class HowToPlayScene extends Scene {
  text: string[] = [
    "You're a truck driver for CargoTrek - small company delivering goods to local towns.",
    '',
    'Your journey starts with small truck but as you complete more deliveries you will be able to afford various upgrades.',
    '',
    "The truck you're driving is a battery electric vehicle.",
    "You will need to charge its battery on the chargers found in the world or while you're staying in towns.",
    '',
    'On the map view use WASD to scroll the map. The truck will move towards cursor when you press left mouse button.',
    'If you lose sight of the truck press Q to center the view on it.',
    '',
    'Press E to enter towns and charge your truck on chargers found in the world.',
    '',
    'Use WASD, Enter and Escape to navigate menus.',
    '',
    '',
    '',
    'Press Escape go to back to main menu.',
  ];

  highlightedText: string;

  constructor() {
    super();

    const ht: string[] = [];

    this.text.forEach((line) => {
      const arr = Array(line.length).fill(' ');

      ['CargoTrek', ' WASD', ' E ', ' Q ', 'Enter ', ' Escape '].forEach((keyword) => {
        const idx = line.indexOf(keyword);
        if (idx === -1) return;

        for (let ii = 0; ii < keyword.length; ii += 1) {
          arr[idx + ii] = keyword[ii];
        }
      });

      ht.push(arr.join(''));
    });

    this.highlightedText = ht.join('\n');
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }
  }

  render(scr: Screen): void {
    scr.clearScreen(ENDESGA16PaletteIdx[3]);

    scr.drawTextInRect(this.text.join('\n'), 0, 2, scr.width, scr.height - 4, ENDESGA16PaletteIdx[1]);

    scr.drawTextInRect(this.highlightedText, 0, 2, scr.width, scr.height - 4, ENDESGA16PaletteIdx[6]);
    scr.drawText('left mouse button', scr.activeFont!.charWidth * 15, scr.activeFont!.charHeight * 16 + 2, ENDESGA16PaletteIdx[6]);
  }
}
