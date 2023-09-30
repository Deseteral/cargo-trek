import { Cargo, CargoStorage, GameState } from 'ludum-dare-54/game/game-state';
import { Assets, Color, ENDESGA16PaletteIdx, Input, Scene, SceneManager, Screen, Texture, Vector2 } from 'ponczek';

export class CargoScene extends Scene {
  storage: CargoStorage;

  pickedAt: (Vector2 | null) = null;
  pickedIdx: number = -1;
  pickOffset: Vector2 = Vector2.zero();

  isValidState: boolean = false;

  cargoTexture: Texture;
  cargoStorageTexture: Texture;

  static exitedWithSuccess: boolean = false;

  constructor(newCargo: Cargo) {
    super();

    this.cargoTexture = Assets.texture('cargo');
    this.cargoStorageTexture = Assets.texture('cargo-storage');

    // Make copy of original CargoStorage
    const newCargoCopy: Cargo = {
      parentJobId: newCargo.parentJobId,
      position: newCargo.position.copy(),
      rects: newCargo.rects.map((r) => r.copy()),
    };

    const cargoCopy: Cargo[] = GameState.cargoStorage.cargo.map((orgCargo) => {
      const position = orgCargo.position.copy();
      const rects = orgCargo.rects.map((r) => r.copy());
      return { parentJobId: orgCargo.parentJobId, position, rects };
    });

    this.storage = {
      bounds: GameState.cargoStorage.bounds.copy(),
      cargo: [...cargoCopy, newCargoCopy],
    };
  }

  update(): void {
    if (Input.pointerLeftPressed && this.pickedAt === null) {
      for (let idx = 0; idx < this.storage.cargo.length; idx += 1) {
        const picked = this.storage.cargo[idx].rects.some((r) => r.containsPoint(Input.pointer));
        if (picked) {
          this.pickedAt = Input.pointer.copy();
          this.pickedIdx = idx;
          this.pickOffset = this.storage.cargo[idx].position.copy().sub(Input.pointer);
          break;
        }
      }
    }

    if (this.pickedAt !== null) {
      const c = this.storage.cargo[this.pickedIdx];

      const diff = this.pickedAt.copy();
      diff.sub(c.position);

      for (let idx = 0; idx < c.rects.length; idx += 1) {
        c.rects[idx].x += diff.x + this.pickOffset.x;
        c.rects[idx].y += diff.y + this.pickOffset.y;
      }

      c.position.add(diff.add(this.pickOffset));

      this.pickedAt = Input.pointer.copy();

      if (Input.pointerLeftPressed === false) {
        this.pickedIdx = -1;
        this.pickedAt = null;
      }
    }

    // Calc valid state
    const allRects = this.storage.cargo.flatMap((c) => c.rects);
    const allInsideStorage = allRects.every((r) => this.storage.bounds.containsRect(r));
    let noCollisions = true;

    for (let r = 0; r < allRects.length; r += 1) {
      if (noCollisions === false) break;

      for (let rr = 0; rr < allRects.length; rr += 1) {
        if (r === rr) continue;

        const r1 = allRects[r];
        const r2 = allRects[rr];
        if (r1.overlaps(r2)) {
          noCollisions = false;
          break;
        }
      }
    }

    this.isValidState = allInsideStorage && noCollisions;

    if (Input.getKeyDown('Escape')) {
      SceneManager.popScene();
    }

    if (Input.getKeyDown('Enter') && this.isValidState) {
      CargoScene.exitedWithSuccess = true;
      GameState.cargoStorage = this.storage;
      SceneManager.popScene();
    }
  }

  render(scr: Screen): void {
    scr.clearScreen(ENDESGA16PaletteIdx[10]);

    scr.color(ENDESGA16PaletteIdx[12]);
    scr.fillRectR(this.storage.bounds);

    scr.drawNineSlice(this.cargoStorageTexture, this.storage.bounds.x + 1, this.storage.bounds.y + 1, this.storage.bounds.width - 2, this.storage.bounds.height - 2, 8, 8);

    for (let idx = 0; idx < this.storage.cargo.length; idx += 1) {
      for (let ridx = 0; ridx < this.storage.cargo[idx].rects.length; ridx += 1) {
        const r = this.storage.cargo[idx].rects[ridx];
        scr.drawNineSlice(this.cargoTexture, r.x + 8, r.y + 8, r.width - 16, r.height - 16, 8, 8);
      }
    }

    if (this.isValidState) {
      scr.drawText('Press enter to continue', 136, 1, Color.white);
    } else {
      scr.drawText('      Place all cargo in\nstorage area to continue', 128, 1, Color.white);
    }
  }
}
