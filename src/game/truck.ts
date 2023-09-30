import { WorldMap } from 'ludum-dare-54/game/world-map';
import { Vector2, Screen, Ponczek, Color, Input } from 'ponczek';

export class Truck {
  public position: Vector2;
  public delta: Vector2 = Vector2.zero();
  public speed: number;

  private worldMap: WorldMap;

  constructor(position: Vector2, worldMap: WorldMap) {
    this.position = position;
    this.speed = 0.5;
    this.worldMap = worldMap;
  }

  driveTowards(worldPosition: Vector2): void {
    const mapIdx = this.worldMap.vecToIdx(this.position);
    const mapTileValue = this.worldMap.tiles[mapIdx];
    const isOnRoad = this.worldMap.roadTiles[mapIdx];
    const terrainModifier = isOnRoad ? 2 : mapTileValue;
    this.delta = worldPosition.copy()
      .sub(this.position)
      .normalize()
      .mul(terrainModifier)
      .mul(this.speed);
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
