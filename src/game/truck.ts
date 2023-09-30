import { GameState } from 'ludum-dare-54/game/game-state';
import { Vector2, Screen, Ponczek, Color } from 'ponczek';

export class Truck {
  public position: Vector2;
  public delta: Vector2 = Vector2.zero();
  public speed: number;

  public battery: number;
  public batteryCapacity: number;

  get batteryPercent(): number {
    return this.battery / this.batteryCapacity;
  }

  constructor(position: Vector2) {
    this.position = position;
    this.speed = 0.5;
    this.battery = 100.0;
    this.batteryCapacity = 100.0;
  }

  driveTowards(worldPosition: Vector2): void {
    if ((this.position.x | 0) === worldPosition.x && (this.position.y | 0) === worldPosition.y) {
      return;
    }

    if (this.battery <= 0) {
      return;
    }

    const mapIdx = GameState.world.vecToIdx(this.position);
    const mapTileValue = GameState.world.tiles[mapIdx];
    const isOnRoad = GameState.world.roadTiles[mapIdx];
    const terrainModifier = isOnRoad ? 2 : mapTileValue;
    this.delta = worldPosition.copy()
      .sub(this.position)
      .normalize()
      .mul(terrainModifier)
      .mul(this.speed);

    const a = 0.1;
    this.battery -= (a * (1 / terrainModifier));
  }

  charge(): void {
    GameState.truck.battery += 1;
    GameState.truck.battery = Math.clamp(GameState.truck.battery, 0, GameState.truck.batteryCapacity);
  }

  update(): void {
    this.position.add(this.delta);
    this.delta.set(0, 0);
  }

  render(scr: Screen): void {
    scr.color(Color.black);
    if ((Ponczek.ticks / 60 | 0) % 2 === 0) {
      scr.drawLine(this.position.x - 1, this.position.y - 1, this.position.x + 1, this.position.y + 1);
      scr.drawLine(this.position.x + 1, this.position.y - 1, this.position.x - 1, this.position.y + 1);
    } else {
      scr.drawLine(this.position.x - 1, this.position.y, this.position.x + 1, this.position.y);
      scr.drawLine(this.position.x, this.position.y - 1, this.position.x, this.position.y + 1);
    }
  }
}
