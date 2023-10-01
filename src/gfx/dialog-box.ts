import { Screen, Assets, Color, ENDESGA16PaletteIdx, ReplaceColorEffect, Texture } from 'ponczek';

export abstract class DialogBox {
  static frameTexture: Texture;
  static frameShadowTexture: Texture;

  static init(): void {
    DialogBox.frameTexture = Texture.copy(Assets.texture('frame'));
    DialogBox.frameShadowTexture = Texture.copy(Assets.texture('frame'));

    // Frame
    const replaceColorEffect = new ReplaceColorEffect(Color.white, Color.transparent);
    replaceColorEffect.apply(DialogBox.frameTexture);

    replaceColorEffect.set(Color.gray, ENDESGA16PaletteIdx[10]);
    replaceColorEffect.apply(DialogBox.frameTexture);

    replaceColorEffect.set(Color.black, ENDESGA16PaletteIdx[11]);
    replaceColorEffect.apply(DialogBox.frameTexture);

    // Frame shadow
    replaceColorEffect.set(Color.white, Color.transparent);
    replaceColorEffect.apply(DialogBox.frameShadowTexture);

    replaceColorEffect.set(Color.gray, Color.black);
    replaceColorEffect.apply(DialogBox.frameShadowTexture);

    replaceColorEffect.set(Color.black, Color.black);
    replaceColorEffect.apply(DialogBox.frameShadowTexture);
  }

  static drawBox(text: string, scr: Screen): void {
    const longestLineLengthPx = Math.max(...text.split('\n').map((s) => s.length)) * scr.activeFont!.charWidth;
    const heightPx = text.split('\n').length * (scr.activeFont!.charHeight);

    const x = ((scr.width - longestLineLengthPx) / 2) | 0;
    const y = ((scr.height - heightPx) / 2) | 0;

    scr.drawNineSlice(DialogBox.frameShadowTexture, x + 2, y + 2, longestLineLengthPx, heightPx, 8, 8);
    scr.drawNineSlice(DialogBox.frameTexture, x, y, longestLineLengthPx, heightPx, 8, 8);
    scr.drawText(text, x, y, Color.white);
  }
}
