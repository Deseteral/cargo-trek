import { Assets, Color, ENDESGA16PaletteIdx, Input, Ponczek, ReplaceColorEffect, Scene, SceneManager, Screen, Texture } from 'ponczek';

export class DialogBoxScene extends Scene {
  text: string;
  longestLineLengthPx: number;
  heightPx: number;

  frameTexture: Texture;
  frameShadowTexture: Texture;

  constructor(text: string) {
    super();
    this.text = text;
    this.longestLineLengthPx = Math.max(...text.split('\n').map((s) => s.length)) * Ponczek.screen.activeFont!.charWidth;
    this.heightPx = text.split('\n').length * (Ponczek.screen.activeFont!.charHeight);

    this.frameTexture = Texture.copy(Assets.texture('frame'));
    this.frameShadowTexture = Texture.copy(Assets.texture('frame'));

    // Frame
    const replaceColorEffect = new ReplaceColorEffect(Color.white, Color.transparent);
    replaceColorEffect.apply(this.frameTexture);

    replaceColorEffect.set(Color.gray, ENDESGA16PaletteIdx[10]);
    replaceColorEffect.apply(this.frameTexture);

    replaceColorEffect.set(Color.black, ENDESGA16PaletteIdx[11]);
    replaceColorEffect.apply(this.frameTexture);

    // Frame shadow
    replaceColorEffect.set(Color.white, Color.transparent);
    replaceColorEffect.apply(this.frameShadowTexture);

    replaceColorEffect.set(Color.gray, Color.black);
    replaceColorEffect.apply(this.frameShadowTexture);

    replaceColorEffect.set(Color.black, Color.black);
    replaceColorEffect.apply(this.frameShadowTexture);
  }

  update(): void {
    if (Input.getKeyDown('Escape') || Input.getKeyDown('Enter')) {
      SceneManager.popScene();
    }
  }

  render(scr: Screen): void {
    const x = ((scr.width - this.longestLineLengthPx) / 2) | 0;
    const y = ((scr.height - this.heightPx) / 2) | 0;

    scr.drawNineSlice(this.frameShadowTexture, x + 2, y + 2, this.longestLineLengthPx, this.heightPx, 8, 8);
    scr.drawNineSlice(this.frameTexture, x, y, this.longestLineLengthPx, this.heightPx, 8, 8);
    scr.drawText(this.text, x, y, Color.white);
  }
}
