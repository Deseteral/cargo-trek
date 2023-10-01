import { GameState } from 'ludum-dare-54/game/game-state';
import { DialogBox } from 'ludum-dare-54/gfx/dialog-box';
import { DialogBoxScene } from 'ludum-dare-54/scenes/dialog-box-scene';
import { HowToPlayScene } from 'ludum-dare-54/scenes/how-to-play-scene';
import { OverworldScene } from 'ludum-dare-54/scenes/overworld-scene';
import { Assets, Color, Datastore, ENDESGA16PaletteIdx, GridView, Input, Ponczek, Random, ReplaceColorEffect, Scene, SceneManager, Screen, SoundPlayer, Texture, Vector2 } from 'ponczek';

interface MenuItem {
  text: string,
  action: () => void,
}

class MainMenuGridView extends GridView<MenuItem> {
  constructor() {
    super(200, 12);
  }

  public drawCell(item: (MenuItem | null), _row: number, _column: number, x: number, y: number, isSelected: boolean, scr: Screen): void {
    if (!item) return;

    const color = isSelected ? ENDESGA16PaletteIdx[6] : Color.white;
    const text = `${isSelected ? '>' : ' '}${item.text}`;
    scr.drawText(text, x, y, color);
    scr.color(color);
    if (isSelected) scr.drawLine(x, y + 8, x + scr.activeFont!.getLineLengthPx(text), y + 8);
  }
}

export class MainMenuScene extends Scene {
  logoTexture: Texture;
  menu: MainMenuGridView;
  frameTexture: Texture;

  creatingNewGame: boolean = false;
  loadingGame: boolean = false;

  constructor() {
    super();

    this.logoTexture = Assets.texture('logo');

    this.menu = new MainMenuGridView();
    this.menu.cells = [
      [{
        text: 'New game',
        action: () => {
          this.creatingNewGame = true;

          setTimeout(() => {
            GameState.create(Random.default.nextInt(0, 9999));
            SceneManager.clearStack(new OverworldScene());
          }, 0);
        },
      }],
      [{
        text: 'Load game',
        action: () => {
          this.loadingGame = true;
          setTimeout(() => {
            this.loadingGame = false;
            if (!Datastore.exists()) {
              SceneManager.pushScene(new DialogBoxScene('There is no saved game.'));
              return;
            }
            GameState.load();
            const overworld = new OverworldScene();
            overworld.lookAtTruck();
            SceneManager.pushScene(overworld);
          }, 0);
        },
      }],
      [{
        text: 'How to play',
        action: () => {
          SceneManager.pushScene(new HowToPlayScene());
        },
      }],
    ];

    this.frameTexture = Texture.copy(Assets.texture('frame'));

    const replaceColorEffect = new ReplaceColorEffect(Color.white, Color.transparent);
    replaceColorEffect.apply(this.frameTexture);

    replaceColorEffect.set(Color.gray, ENDESGA16PaletteIdx[10]);
    replaceColorEffect.apply(this.frameTexture);

    replaceColorEffect.set(Color.black, ENDESGA16PaletteIdx[11]);
    replaceColorEffect.apply(this.frameTexture);
  }

  update(): void {
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

  render(scr: Screen): void {
    scr.clearScreen(ENDESGA16PaletteIdx[3]);

    scr.drawTexture(this.logoTexture, 0, 10);

    const longestLineLengthPx = 'How to play'.length * scr.activeFont!.charWidth;
    const x = ((scr.width - longestLineLengthPx) / 2) | 0;
    const y = 100;

    scr.drawNineSlice(this.frameTexture, x, y, longestLineLengthPx + 8, 34, 8, 8);
    this.menu.drawAt(new Vector2(x, y), scr);

    scr.drawText('Created in 48 hours for Ludum Dare 54', 1, scr.height - 10, ENDESGA16PaletteIdx[1]);

    if (this.loadingGame) {
      DialogBox.drawBox('Loading...', Ponczek.screen);
    }

    if (this.creatingNewGame) {
      DialogBox.drawBox('Generating new world', Ponczek.screen);
    }
  }
}
