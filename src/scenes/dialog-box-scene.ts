import { DialogBox } from 'ludum-dare-54/gfx/dialog-box';
import { Input, Scene, SceneManager, Screen } from 'ponczek';

export class DialogBoxScene extends Scene {
  text: string;

  constructor(text: string) {
    super();
    this.text = text;
  }

  update(): void {
    if (Input.getKeyDown('Escape') || Input.getKeyDown('Enter')) {
      SceneManager.popScene();
    }
  }

  render(scr: Screen): void {
    DialogBox.drawBoxCenter(this.text, scr);
  }
}
