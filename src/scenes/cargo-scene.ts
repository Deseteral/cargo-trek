import { CargoStorage, GameState } from 'ludum-dare-54/game/game-state';
import { Color, Input, Scene, Screen, Vector2 } from 'ponczek';

export class CargoScene extends Scene {
  storage: CargoStorage;

  pickedAt: (Vector2 | null) = null;
  pickedIdx: number = -1;
  pickOffset: Vector2 = Vector2.zero();

  isValidState: boolean = false;

  constructor() {
    super();

    // Make copy of original CargoStorage
    const cargo = GameState.cargoStorage.cargo.map((orgCargo) => {
      const position = orgCargo.position.copy();
      const rects = orgCargo.rects.map((r) => r.copy());
      return { position, rects };
    });

    this.storage = {
      bounds: GameState.cargoStorage.bounds.copy(),
      cargo,
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

    if (Input.getKeyDown('Enter') && this.isValidState) {
      console.log('go go go ');
    }
  }

  render(scr: Screen): void {
    scr.clearScreen();
    scr.color(Color.blue);
    scr.drawRectR(this.storage.bounds);

    scr.color(Color.green);
    for (let idx = 0; idx < this.storage.cargo.length; idx += 1) {
      for (let ridx = 0; ridx < this.storage.cargo[idx].rects.length; ridx += 1) {
        scr.drawRectR(this.storage.cargo[idx].rects[ridx]);
      }
    }

    if (this.isValidState) {
      scr.drawText('Press enter to continue', 137, 0, Color.white);
    } else {
      scr.drawText('Place all cargo in storage\n          area to continue', 113, 0, Color.white);
    }
  }
}
