import { ENDESGA16PaletteIdx, Screen, Color, Texture, Pathfinder, Random, SimplexNoise, Vector2 } from 'ponczek';

export class WorldMap {
  private random: Random;
  private noise: SimplexNoise;

  public mapSize: number;

  public tiles: number[];
  public roadTiles: boolean[];
  public cities: Vector2[] = [];

  public noiseTexture: Texture;
  public topoTexture: Texture;
  public roadPathTexture: Texture;
  public fogScreen: Screen;

  // Map generator noise values
  private om: number = 3;
  private l: number = 3.687; //  8.38;
  private p: number = 0.19; //  0.173;
  private s: number = 0.004; // 0.015; //  0.028;

  constructor(mapSize: number, seed?: number) {
    this.random = new Random(seed);
    this.noise = new SimplexNoise(this.random);
    this.mapSize = mapSize;

    this.tiles = new Array(this.mapSize * this.mapSize).fill(0);
    this.roadTiles = new Array(this.mapSize * this.mapSize).fill(false);

    this.noiseTexture = Texture.createEmpty(this.mapSize, this.mapSize);
    this.topoTexture = Texture.createEmpty(this.mapSize, this.mapSize);
    this.roadPathTexture = Texture.createEmpty(this.mapSize, this.mapSize);
    this.fogScreen = new Screen(this.mapSize, this.mapSize);

    this.fogScreen.color(Color.black);
    this.fogScreen.fillRect(0, 0, this.mapSize, this.mapSize);
  }

  vecToIdx(vec: Vector2): number {
    return this.posToIdx(vec.x | 0, vec.y | 0);
  }

  posToIdx(x: number, y: number): number {
    const idx = x + (y * this.mapSize);
    if (idx < 0 || idx > (this.mapSize * this.mapSize)) return -1;
    return idx;
  }

  noiseValueAt(x: number, y: number, scale: number): number {
    // Borders
    if (x === 0 || y === 0 || x === this.mapSize - 1 || y === this.mapSize - 1) {
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

  generate(): void {
    // Terrain
    for (let y = 0; y < this.mapSize; y += 1) {
      for (let x = 0; x < this.mapSize; x += 1) {
        const nn = this.noiseValueAt(x, y, this.s);

        const idx = this.posToIdx(x, y);
        this.tiles[idx] = nn;

        const noiseColor = new Color(nn, nn, nn, 1);
        this.noiseTexture.data.setPixel(x, y, noiseColor);

        let topoColor = new Color(nn, nn, nn, 1);
        if (nn > 0.88) {
          topoColor = ENDESGA16PaletteIdx[8];
        } else if (nn > 0.51) {
          topoColor = ENDESGA16PaletteIdx[9];
        } else if (nn > 0.33) {
          topoColor = ENDESGA16PaletteIdx[2];
        } else if (nn > 0.18) {
          topoColor = ENDESGA16PaletteIdx[3];
        } else {
          topoColor = Color.white;
        }

        for (let i = 0.1; i < 1; i += 0.1) {
          const tt = i;
          const tol = 0.005;
          if (nn > (tt - tol) && nn < (tt + tol)) {
            topoColor = Color.gray;
          }
        }

        this.topoTexture.data.setPixel(x, y, topoColor);
      }
    }
    this.noiseTexture.data.commit();
    this.topoTexture.data.commit();

    // Cities
    const sectorSize = 50 * 4;
    for (let y = 0; y < this.mapSize; y += sectorSize) {
      for (let x = 0; x < this.mapSize; x += sectorSize) {
        const sx = (x + (sectorSize / 4)) | 0;
        const sy = (y + (sectorSize / 4)) | 0;
        const ex = (x + sectorSize - (sectorSize / 4)) | 0;
        const ey = (y + sectorSize - (sectorSize / 4)) | 0;

        let mm = 0;
        let mx = sx;
        let my = sy;

        for (let yy = sy; yy < ey; yy += 1) {
          for (let xx = sx; xx < ex; xx += 1) {
            const vv = this.noiseValueAt(xx, yy, this.s);
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

    const roads: Vector2[][] = [];
    roadConnectionIdx.forEach((pp) => {
      const [fromIdx, toIdx] = pp.split('-').map((s) => parseInt(s, 10) | 0);
      roads.push([this.cities[fromIdx], this.cities[toIdx]]);
    });

    // Generate paths for roads
    const pathfinder = new Pathfinder(this.mapSize, this.mapSize);
    for (let y = 0; y < this.mapSize; y += 1) {
      for (let x = 0; x < this.mapSize; x += 1) {
        const idx = x + (y * this.mapSize);
        const v = this.noiseValueAt(x, y, this.s);
        pathfinder.setCost(idx, v);
      }
    }

    for (let roadIdx = 0; roadIdx < roads.length; roadIdx += 1) {
      const from = roads[roadIdx][0];
      const to = roads[roadIdx][1];
      const points = pathfinder.search(from.x, from.y, to.x, to.y, true, 'euclidean');

      for (let pi = 0; pi < points.length; pi += 1) {
        for (let yy = -1; yy <= 1; yy += 1) {
          for (let xx = -1; xx <= 1; xx += 1) {
            const x = points[pi].x + xx;
            const y = points[pi].y + yy;
            const idx = this.posToIdx(x, y);
            if (idx === -1) continue;
            if (this.roadTiles[idx]) continue;
            this.roadPathTexture.data.setPixel(x, y, ENDESGA16PaletteIdx[7]);
            this.roadTiles[idx] = true;
          }
        }
      }

      for (let pi = 0; pi < points.length; pi += 1) {
        this.roadPathTexture.data.setPixel(points[pi].x, points[pi].y, ENDESGA16PaletteIdx[10]);
      }

      this.roadPathTexture.data.commit();
    }
  }

  clearFogAt(position: Vector2): void {
    const radius = 20;
    this.fogScreen.color(Color.red);
    this.fogScreen.clearCircleV(position, radius);
  }
}
