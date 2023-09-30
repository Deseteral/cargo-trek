import { Scene, Screen, Color, SimplexNoise, Texture, Random, Vector2, Camera, Input, ENDESGA16PaletteIdx, Pathfinder } from 'ponczek';

const MAP_SIZE = 400 * 4;

export class MapGeneratorTestScene extends Scene {
  private noise: SimplexNoise;
  private noiseTexture: Texture;
  private roadPathTexture: Texture;
  private random: Random;

  private om: number = 3;
  private l: number = 3.687; //  8.38;
  private p: number = 0.19; //  0.173;
  private s: number = 0.004; // 0.015; //  0.028;

  private cities: Vector2[] = [];
  private roads: Vector2[][] = [];

  private camera: Camera;

  constructor() {
    super();
    this.random = new Random(12345);
    this.noise = new SimplexNoise(this.random);
    this.noiseTexture = Texture.createEmpty(MAP_SIZE, MAP_SIZE);
    this.roadPathTexture = Texture.createEmpty(MAP_SIZE, MAP_SIZE);
    this.camera = new Camera(new Vector2(100, 100));

    this.regenerate();
  }

  mapValueAt(x: number, y: number, scale: number): number {
    // Borders
    if (x === 0 || y === 0 || x === MAP_SIZE - 1 || y === MAP_SIZE - 1) {
      return 0;
    }

    let nn = 0;

    for (let oc = 0; oc <= this.om; oc += 1) {
      const f = this.l ** oc;
      const a = this.p ** oc;
      const v = this.noise.get(x, y, f * scale) * a;
      nn += v;
    }

    return nn;
  }

  regenerate(): void {
    // Terrain
    for (let y = 0; y < MAP_SIZE; y += 1) {
      for (let x = 0; x < MAP_SIZE; x += 1) {
        const nn = this.mapValueAt(x, y, this.s);

        let cc = new Color(nn, nn, nn, 1);

        if (nn > 0.88) {
          cc = ENDESGA16PaletteIdx[8];
        } else if (nn > 0.51) {
          cc = ENDESGA16PaletteIdx[9];
        } else if (nn > 0.33) {
          cc = ENDESGA16PaletteIdx[2];
        } else if (nn > 0.18) {
          cc = ENDESGA16PaletteIdx[3];
        } else {
          cc = Color.white;
        }

        for (let i = 0.1; i < 1; i += 0.1) {
          const tt = i;
          const tol = 0.005;
          if (nn > (tt - tol) && nn < (tt + tol)) {
            cc = Color.gray;
          }
        }

        this.noiseTexture.data.setPixel(x, y, cc);
      }
    }
    this.noiseTexture.data.commit();

    // Cities
    const secSize = 50 * 4;
    for (let y = 0; y < MAP_SIZE; y += secSize) {
      for (let x = 0; x < MAP_SIZE; x += secSize) {
        const sx = (x + (secSize / 4)) | 0;
        const sy = (y + (secSize / 4)) | 0;
        const ex = (x + secSize - (secSize / 4)) | 0;
        const ey = (y + secSize - (secSize / 4)) | 0;

        let mm = 0;
        let mx = sx;
        let my = sy;

        for (let yy = sy; yy < ey; yy += 1) {
          for (let xx = sx; xx < ex; xx += 1) {
            const vv = this.mapValueAt(xx, yy, this.s);
            if (vv > mm) {
              mm = vv;
              mx = xx;
              my = yy;
            }
          }
        }

        this.cities.push(new Vector2(mx, my));
      }
    }

    // Roads
    const roadConnectionIdx = new Set<string>();
    for (let ci = 0; ci < this.cities.length; ci += 1) {
      const current = this.cities[ci];
      const count = this.random.nextInt(0, 3);

      const byDistance = this.cities
        .map((pos, idx) => ({ idx, dist: Vector2.sqrDistance(current, pos) }))
        .sort((a, b) => a.dist - b.dist);

      for (let ct = 1; ct <= count; ct += 1) {
        roadConnectionIdx.add((ci < byDistance[ct].idx)
          ? `${ci}-${byDistance[ct].idx}`
          : `${byDistance[ct].idx}-${ci}`);
      }
    }

    roadConnectionIdx.forEach((pp) => {
      const [fromIdx, toIdx] = pp.split('-').map((s) => parseInt(s, 10) | 0);
      this.roads.push([this.cities[fromIdx], this.cities[toIdx]]);
    });

    // Generate paths for roads
    const pathfinder = new Pathfinder(MAP_SIZE, MAP_SIZE);
    for (let y = 0; y < MAP_SIZE; y += 1) {
      for (let x = 0; x < MAP_SIZE; x += 1) {
        const idx = x + (y * MAP_SIZE);
        const v = this.mapValueAt(x, y, this.s);
        pathfinder.setCost(idx, v);
      }
    }

    for (let roadIdx = 0; roadIdx < this.roads.length; roadIdx += 1) {
      const from = this.roads[roadIdx][0];
      const to = this.roads[roadIdx][1];
      const points = pathfinder.search(from.x, from.y, to.x, to.y, true, 'euclidean');

      for (let pi = 0; pi < points.length; pi += 1) {
        for (let yy = -1; yy <= 1; yy += 1) {
          for (let xx = -1; xx <= 1; xx += 1) {
            this.roadPathTexture.data.setPixel(points[pi].x + xx, points[pi].y + yy, ENDESGA16PaletteIdx[10]);
          }
        }
      }
      this.roadPathTexture.data.commit();
    }
  }

  update(): void {
    ImGui.Begin('M');
    ImGui.SliderFloat('o', (n = this.om) => this.om = (n | 0), 1, 20);
    ImGui.SliderFloat('l', (n = this.l) => this.l = n, 0, 20);
    ImGui.SliderFloat('p', (n = this.p) => this.p = n, 0, 1);
    ImGui.SliderFloat('s', (n = this.s) => this.s = n, 0, 0.028);
    ImGui.End();

    // this.regenerate();

    if (Input.getKey('KeyA')) this.camera.position.x -= 1;
    if (Input.getKey('KeyD')) this.camera.position.x += 1;
    if (Input.getKey('KeyW')) this.camera.position.y -= 1;
    if (Input.getKey('KeyS')) this.camera.position.y += 1;
  }

  render(scr: Screen): void {
    scr.clearScreen();

    this.camera.begin();

    scr.drawTexture(this.noiseTexture, 0, 0);
    scr.drawTexture(this.roadPathTexture, 0, 0);

    for (let i = 0; i < this.cities.length; i += 1) {
      const c = this.cities[i];
      scr.color(Color.blue);
      scr.fillRect(c.x - 2, c.y - 2, 4, 4);
    }

    // for (let i = 0; i < this.roads.length; i += 1) {
    //   const r = this.roads[i];
    //   scr.drawLineV(r[0], r[1]);
    // }

    this.camera.end();
  }
}
