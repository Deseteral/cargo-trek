import { Truck } from 'ludum-dare-54/game/truck';
import { WorldMap } from 'ludum-dare-54/game/world-map';
import { CityScene } from 'ludum-dare-54/scenes/city-scene';
import { Scene, Screen, Vector2, Camera, Input, ENDESGA16PaletteIdx, Color, Ponczek, SceneManager } from 'ponczek';

export class OverworldScene extends Scene {
  public worldMap: WorldMap;
  public camera: Camera;
  public truck: Truck;

  private mouseInWorld: Vector2 = Vector2.zero();

  constructor() {
    super();
    this.worldMap = new WorldMap(400);
    this.camera = new Camera();

    this.worldMap.generate();

    const firstCityPos = this.worldMap.cities[0].position.copy();
    this.truck = new Truck(firstCityPos, this.worldMap);
    this.camera.lookAt(firstCityPos);
  }

  update(): void {
    // ImGui.Begin('M');
    // ImGui.SliderFloat('o', (n = this.om) => this.om = (n | 0), 1, 20);
    // ImGui.SliderFloat('l', (n = this.l) => this.l = n, 0, 20);
    // ImGui.SliderFloat('p', (n = this.p) => this.p = n, 0, 1);
    // ImGui.SliderFloat('s', (n = this.s) => this.s = n, 0, 0.028);
    // ImGui.End();

    const cameraSpeed = 1;
    if (Input.getKey('KeyA')) this.camera.position.x -= cameraSpeed;
    if (Input.getKey('KeyD')) this.camera.position.x += cameraSpeed;
    if (Input.getKey('KeyW')) this.camera.position.y -= cameraSpeed;
    if (Input.getKey('KeyS')) this.camera.position.y += cameraSpeed;

    this.camera.screenToWorld(Input.pointer, this.mouseInWorld);

    if (Input.pointerLeftPressed) {
      this.truck.driveTowards(this.mouseInWorld);
    }

    this.truck.update();
    this.worldMap.clearFogAt(this.truck.position);

    if (Input.getKeyDown('KeyE')) {
      for (let idx = 0; idx < this.worldMap.cities.length; idx += 1) {
        const c = this.worldMap.cities[idx];
        const dst = Vector2.sqrDistance(c.position, this.truck.position);
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
    scr.drawTexture(this.worldMap.topoTexture, 0, 0);
    scr.drawTexture(this.worldMap.roadPathTexture, 0, 0);

    // Fog layer
    scr._ctx.drawImage(this.worldMap.fogScreen._domElement, 0, 0);

    // Cities
    for (let i = 0; i < this.worldMap.cities.length; i += 1) {
      const c = this.worldMap.cities[i];
      scr.color(ENDESGA16PaletteIdx[4]);
      scr.fillRect(c.position.x - 2, c.position.y - 2, 4, 4);
    }

    // Trucks
    this.truck.render(scr);

    // City names
    for (let i = 0; i < this.worldMap.cities.length; i += 1) {
      const c = this.worldMap.cities[i];
      const x = c.position.x + 1;
      const y = c.position.y + 2;
      scr.drawText(c.name, x + 1, y + 1, Color.black);
      scr.drawText(c.name, x, y, Color.white);
    }

    this.camera.end();
  }
}
