import { GameState } from 'ludum-dare-54/game/game-state';
import { OverworldScene } from 'ludum-dare-54/scenes/overworld-scene';
import { ENDESGA16PaletteIdx, Ponczek, Random, Scene, SceneManager, Screen } from 'ponczek';

export class InitScene extends Scene {
  init = true;

  update(): void {
    if (this.init) {
      Ponczek.screen.activeFont!.generateColorVariants([
        ENDESGA16PaletteIdx[4],
        ENDESGA16PaletteIdx[6],
        ENDESGA16PaletteIdx[12],
      ]);

      GameState.create(Random.default.nextInt(0, 9999));
      SceneManager.clearStack(new OverworldScene());

      this.init = false;
    }
  }

  render(_scr: Screen): void { }
}
