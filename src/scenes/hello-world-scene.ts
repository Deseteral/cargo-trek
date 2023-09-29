import { Scene, Screen, Color } from 'ponczek';

export class HelloWorldScene extends Scene {
  update(): void { }

  render(scr: Screen): void {
    scr.clearScreen(Color.black);
    scr.drawText('Hello world, Ponczku!', 10, 10, Color.white);
  }
}
