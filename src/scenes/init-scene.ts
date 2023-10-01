import { DialogBox } from 'ludum-dare-54/gfx/dialog-box';
import { MainMenuScene } from 'ludum-dare-54/scenes/main-menu-scene';
import { ENDESGA16PaletteIdx, Ponczek, Scene, SceneManager, Screen } from 'ponczek';

export class InitScene extends Scene {
  init = true;

  update(): void {
    if (this.init) {
      Ponczek.screen.activeFont!.generateColorVariants([
        ENDESGA16PaletteIdx[4],
        ENDESGA16PaletteIdx[6],
        ENDESGA16PaletteIdx[12],
        ENDESGA16PaletteIdx[9],
        ENDESGA16PaletteIdx[1],
      ]);

      DialogBox.init();

      SceneManager.clearStack(new MainMenuScene());

      this.init = false;
    }
  }

  render(_scr: Screen): void { }
}
