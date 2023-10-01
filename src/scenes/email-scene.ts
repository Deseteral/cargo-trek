import { OverworldScene } from 'ludum-dare-54/scenes/overworld-scene';
import { ENDESGA16PaletteIdx, Input, Scene, SceneManager, Screen } from 'ponczek';

export class EmailScene extends Scene {
  text: string = [
    '   from: bob@cargo.trek',
    '     to: riley@cargo.trek',
    'subject: Welcome to Cargo Trek!',
    '',
    '',
    'Dear Riley,',
    '',
    'Welcome to Cargo Trek!',
    "We're excited to have you on board as a truck driver here in Arcadian Valley.",
    '',
    'Your role is essential in delivering goods to our local communities. Your job makes a difference!',
    '',
    'Good luck!',
    'Bob',
    '',
    '',
    "P.S. Your truck is able to handle the rough terrain out here. Don't hesitate to drive off the road ;)",
  ].join('\n');

  update(): void {
    if (Input.getKeyDown('Enter')) {
      SceneManager.clearStack(new OverworldScene());
    }
  }

  render(scr: Screen): void {
    scr.clearScreen(ENDESGA16PaletteIdx[12]);
    scr.drawTextInRect(this.text, 2, 4, scr.width - 4, scr.height - 4, ENDESGA16PaletteIdx[10]);
  }
}
