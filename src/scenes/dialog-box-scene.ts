import { Color, Input, Scene, SceneManager, Screen } from 'ponczek';

export class DialogBoxScene extends Scene {
  text: string;

  constructor(text: string) {
    super();
    this.text = text;
  }

  update(): void {
    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }
  }

  render(scr: Screen): void {
    scr.color(Color.black);
    scr.fillRect(10, 10, 200, 100);
    scr.drawText(this.text, 10, 10, Color.white);
  }
}
