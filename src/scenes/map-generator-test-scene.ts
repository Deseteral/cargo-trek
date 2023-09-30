import { Truck } from 'ludum-dare-54/game/truck';
import { WorldMap } from 'ludum-dare-54/game/world-map';
import { Scene, Screen, Vector2, Camera, Input, ENDESGA16PaletteIdx } from 'ponczek';

export class MapGeneratorTestScene extends Scene {
  public worldMap: WorldMap;
  public camera: Camera;
  public truck: Truck;

  private mouseInWorld: Vector2 = Vector2.zero();

  constructor() {
    super();
    this.worldMap = new WorldMap(400);
    this.camera = new Camera(new Vector2(200, 200));
    this.truck = new Truck(new Vector2(10, 10), this.worldMap);

    this.worldMap.generate();
  }

  update(): void {
    // ImGui.Begin('M');
    // ImGui.SliderFloat('o', (n = this.om) => this.om = (n | 0), 1, 20);
    // ImGui.SliderFloat('l', (n = this.l) => this.l = n, 0, 20);
    // ImGui.SliderFloat('p', (n = this.p) => this.p = n, 0, 1);
    // ImGui.SliderFloat('s', (n = this.s) => this.s = n, 0, 0.028);
    // ImGui.End();

    if (Input.getKey('KeyA')) this.camera.position.x -= 1;
    if (Input.getKey('KeyD')) this.camera.position.x += 1;
    if (Input.getKey('KeyW')) this.camera.position.y -= 1;
    if (Input.getKey('KeyS')) this.camera.position.y += 1;

    this.camera.screenToWorld(Input.pointer, this.mouseInWorld);

    if (Input.pointerLeftPressed) {
      this.truck.driveTowards(this.mouseInWorld);
    }

    this.truck.update();

    this.worldMap.clearFogAt(this.truck.position);
  }

  render(scr: Screen): void {
    scr.clearScreen();

    this.camera.begin();

    scr.drawTexture(this.worldMap.topoTexture, 0, 0);
    scr.drawTexture(this.worldMap.roadPathTexture, 0, 0);

    this.truck.render(scr);

    scr._ctx.drawImage(this.worldMap.fogScreen._domElement, 0, 0);

    for (let i = 0; i < this.worldMap.cities.length; i += 1) {
      const c = this.worldMap.cities[i];
      scr.color(ENDESGA16PaletteIdx[4]);
      scr.fillRect(c.x - 2, c.y - 2, 4, 4);
    }

    this.camera.end();
  }
}
