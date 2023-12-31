import { GameState } from 'ludum-dare-54/game/game-state';
import { Vector2, Screen, Ponczek, Color } from 'ponczek';

export class Truck {
  public position: Vector2;

  public delta: Vector2 = Vector2.zero();
  public speed: number = 0.2;

  public battery: number = 100;
  public batteryCapacity: number = 100;

  audioContext: AudioContext;
  drivingSound: OscillatorNode;
  drivingSoundGain: GainNode;
  isDrivingSoundPlaying: boolean = false;

  get batteryPercent(): number {
    return this.battery / this.batteryCapacity;
  }

  constructor(position: Vector2) {
    this.position = position;

    // const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();

    this.drivingSound = new OscillatorNode(this.audioContext, { type: 'sine', frequency: 120 });
    this.drivingSoundGain = this.audioContext.createGain();
    // this.drivingSound.connect(this.drivingSoundGain);
    this.drivingSoundGain.connect(this.audioContext.destination);
    this.drivingSoundGain.gain.value = 0.4;
    this.drivingSound.start();
  }

  driveTowards(worldPosition: Vector2): void {
    if ((this.position.x | 0) === worldPosition.x && (this.position.y | 0) === worldPosition.y) {
      if (this.isDrivingSoundPlaying) {
        this.drivingSound.disconnect(this.drivingSoundGain);
        this.isDrivingSoundPlaying = false;
      }
      return;
    }

    if (this.battery <= 0) {
      if (this.isDrivingSoundPlaying) {
        this.drivingSound.disconnect(this.drivingSoundGain);
        this.isDrivingSoundPlaying = false;
      }
      return;
    }

    const mapIdx = GameState.world.vecToIdx(this.position);
    const mapTileValue = GameState.upgrades.terrainPack
      ? GameState.world.tiles[mapIdx] * 1.75
      : GameState.world.tiles[mapIdx];
    const isOnRoad = GameState.world.roadTiles[mapIdx];
    const terrainModifier = isOnRoad ? 2 : mapTileValue;
    this.delta = worldPosition.copy()
      .sub(this.position)
      .normalize()
      .mul(terrainModifier)
      .mul(GameState.upgrades.speedBoost ? (this.speed * 1.75) : this.speed);

    this.drivingSound.frequency.setValueAtTime(90 + (100 * (this.delta.copy().sqrMagnitude * 2)), this.audioContext.currentTime);

    const efficiency = GameState.upgrades.highEfficiency ? 0.04 : 0.1;
    this.battery -= (efficiency * (1 / terrainModifier));

    if (!this.isDrivingSoundPlaying) {
      this.drivingSound.connect(this.drivingSoundGain);
      this.isDrivingSoundPlaying = true;
    }
  }

  stopDriving(): void {
    if (this.isDrivingSoundPlaying) {
      this.drivingSound.disconnect(this.drivingSoundGain);
      this.isDrivingSoundPlaying = false;
    }
  }

  charge(): void {
    GameState.truck.battery += GameState.upgrades.fastCharging ? 0.5 : 0.2;
    GameState.truck.battery = Math.clamp(GameState.truck.battery, 0, GameState.truck.batteryCapacity);
  }

  update(): void {
    this.position.add(this.delta);
    GameState.distanceDriven += this.delta.magnitude;
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
