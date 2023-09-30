import { GameState } from 'ludum-dare-54/game/game-state';
import { CityScene } from 'ludum-dare-54/scenes/city-scene';
import { Scene, Screen, Vector2, Camera, Input, ENDESGA16PaletteIdx, Color, SceneManager, Ponczek, Timer } from 'ponczek';

const UNTIL_NEXT_MINUTE_MS = 1;

export class OverworldScene extends Scene {
  camera: Camera;
  mouseInWorld: Vector2 = Vector2.zero();
  worldTimeProgressionTimer: Timer;

  constructor() {
    super();
    this.camera = new Camera();
    this.camera.lookAt(GameState.truck.position);

    this.worldTimeProgressionTimer = new Timer();
    this.worldTimeProgressionTimer.set(UNTIL_NEXT_MINUTE_MS);

    // TODO: Move this to main menu scene
    Ponczek.screen.activeFont?.generateColorVariant(ENDESGA16PaletteIdx[4]);
  }

  update(): void {
    // ImGui.Begin('M');
    // ImGui.SliderFloat('o', (n = this.om) => this.om = (n | 0), 1, 20);
    // ImGui.SliderFloat('l', (n = this.l) => this.l = n, 0, 20);
    // ImGui.SliderFloat('p', (n = this.p) => this.p = n, 0, 1);
    // ImGui.SliderFloat('s', (n = this.s) => this.s = n, 0, 0.028);
    // ImGui.End();

    if (this.worldTimeProgressionTimer.checkSet(UNTIL_NEXT_MINUTE_MS)) {
      GameState.time += 1;
    }

    const cameraSpeed = 1;
    if (Input.getKey('KeyA')) this.camera.position.x -= cameraSpeed;
    if (Input.getKey('KeyD')) this.camera.position.x += cameraSpeed;
    if (Input.getKey('KeyW')) this.camera.position.y -= cameraSpeed;
    if (Input.getKey('KeyS')) this.camera.position.y += cameraSpeed;

    this.camera.screenToWorld(Input.pointer, this.mouseInWorld);

    if (Input.pointerLeftPressed) {
      GameState.truck.driveTowards(this.mouseInWorld);
    }

    GameState.truck.update();
    GameState.world.clearFogAt(GameState.truck.position);

    if (Input.getKeyDown('KeyE')) {
      for (let idx = 0; idx < GameState.world.cities.length; idx += 1) {
        const c = GameState.world.cities[idx];
        const dst = Vector2.sqrDistance(c.position, GameState.truck.position);
        if (dst < 3) {
          SceneManager.pushScene(new CityScene(c));
        }
      }
    }
  }

  render(scr: Screen): void {
    scr.clearScreen();

    this.camera.begin();

    // Map
    scr.drawTexture(GameState.world.topoTexture, 0, 0);
    scr.drawTexture(GameState.world.topoLinesTexture, 0, 0);
    scr.drawTexture(GameState.world.roadPathTexture, 0, 0);

    // Fog layer
    scr._ctx.drawImage(GameState.world.fogScreen._domElement, 0, 0);

    // Cities
    for (let i = 0; i < GameState.world.cities.length; i += 1) {
      const c = GameState.world.cities[i];
      scr.color(ENDESGA16PaletteIdx[4]);
      scr.fillRect(c.position.x - 2, c.position.y - 2, 4, 4);
    }

    // Trucks
    GameState.truck.render(scr);

    // City names
    for (let i = 0; i < GameState.world.cities.length; i += 1) {
      const c = GameState.world.cities[i];
      const x = c.position.x + 1;
      const y = c.position.y + 2;
      scr.drawText(c.name, x + 1, y + 1, Color.black);
      scr.drawText(c.name, x, y, Color.white);
    }

    this.camera.end();

    // Time
    scr.drawText(this.formattedTime(), 10, 10, Color.white);
  }

  formattedTime(): string {
    let t = GameState.time;
    const day = (t / (60 * 24)) | 0;
    t -= day * (60 * 24);
    const hour = ((t / 60) | 0);
    t -= hour * 60;
    const minute = t;

    return `Day ${day}, ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
}
