import { Color, Input, Screen } from 'ponczek';

export function drawCursor(scr: Screen): void {
  const cursorSize = 3;
  scr.color(Color.black);
  scr.drawLine(Input.pointer.x - cursorSize + 1, Input.pointer.y + 1, Input.pointer.x + cursorSize + 1, Input.pointer.y + 1);
  scr.drawLine(Input.pointer.x + 1, Input.pointer.y - cursorSize + 1, Input.pointer.x + 1, Input.pointer.y + cursorSize + 1);

  scr.color(Color.white);
  scr.drawLine(Input.pointer.x - cursorSize, Input.pointer.y, Input.pointer.x + cursorSize, Input.pointer.y);
  scr.drawLine(Input.pointer.x, Input.pointer.y - cursorSize, Input.pointer.x, Input.pointer.y + cursorSize);
}
