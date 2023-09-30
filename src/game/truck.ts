import { WorldMap } from 'ludum-dare-54/game/world-map';
import { Vector2 } from 'ponczek/math';

export class Truck {
  public position: Vector2;
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
    const delta = worldPosition.copy()
      .sub(this.position)
      .normalize()
      .mul(terrainModifier)
      .mul(this.speed);

    this.position.add(delta);
  }
}
