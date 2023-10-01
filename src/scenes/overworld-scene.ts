import { GameState } from 'ludum-dare-54/game/game-state';
import { formattedCalendarTime } from 'ludum-dare-54/game/world-time';
import { CityScene } from 'ludum-dare-54/scenes/city-scene';
import { DialogBoxScene } from 'ludum-dare-54/scenes/dialog-box-scene';
import { OverworldPauseScene } from 'ludum-dare-54/scenes/overworld-pause-scene';
import { Scene, Screen, Vector2, Camera, Input, ENDESGA16PaletteIdx, Color, SceneManager, Timer, Texture, Assets, SoundPlayer, SoundPlaybackId } from 'ponczek';

const UNTIL_NEXT_MINUTE_MS = 1;
const CHARGE_PRICE = 0.2;

export class OverworldScene extends Scene {
  camera: Camera;
  mouseInWorld: Vector2 = Vector2.zero();
  worldTimeProgressionTimer: Timer;

  batteryTexture: Texture;

  chargingCost: number = 0;
  drawChargingCost: boolean = false;
  noBatteryTimer: Timer = new Timer();
  noBatteryNeedsToBeTeleported: boolean = false;
  chargingSound: (SoundPlaybackId | null) = null;

  constructor() {
    super();
    this.camera = new Camera();
    this.lookAtTruck();

    this.worldTimeProgressionTimer = new Timer();
    this.worldTimeProgressionTimer.set(UNTIL_NEXT_MINUTE_MS);

    this.batteryTexture = Assets.texture('battery');
  }

  lookAtTruck(): void {
    this.camera.lookAt(GameState.truck.position);
  }

  update(): void {
    // ImGui.Begin('M');
    // ImGui.SliderFloat('o', (n = this.om) => this.om = (n | 0), 1, 20);
    // ImGui.SliderFloat('l', (n = this.l) => this.l = n, 0, 20);
    // ImGui.SliderFloat('p', (n = this.p) => this.p = n, 0, 1);
    // ImGui.SliderFloat('s', (n = this.s) => this.s = n, 0, 0.028);
    // ImGui.End();

    if (Input.getKeyDown('Escape')) {
      SceneManager.pushScene(new OverworldPauseScene(this));
    }

    if (this.worldTimeProgressionTimer.checkSet(UNTIL_NEXT_MINUTE_MS)) {
      GameState.time += 1;
    }

    const cameraSpeed = 1;
    if (Input.getKey('KeyA')) this.camera.position.x -= cameraSpeed;
    if (Input.getKey('KeyD')) this.camera.position.x += cameraSpeed;
    if (Input.getKey('KeyW')) this.camera.position.y -= cameraSpeed;
    if (Input.getKey('KeyS')) this.camera.position.y += cameraSpeed;

    this.camera.screenToWorld(Input.pointer, this.mouseInWorld);

    if (Input.pointerLeftPressed) {
      GameState.truck.driveTowards(this.mouseInWorld);
    } else {
      GameState.truck.stopDriving();
    }

    if (Input.getKeyDown('KeyQ')) this.lookAtTruck();

    GameState.truck.update();
    GameState.world.clearFogAt(GameState.truck.position);

    if (this.noBatteryNeedsToBeTeleported) {
      this.noBatteryNeedsToBeTeleported = false;
      this.noBatteryTimer.disable();

      const nearestCity = GameState.world.cities
        .map((city) => ({ city, distance: Vector2.sqrDistance(city.position, GameState.truck.position) }))
        .sort((a, b) => a.distance - b.distance)
        .at(0)!.city;

      GameState.truck.position = nearestCity.position.copy();
      GameState.time += (60 * 24);
      SceneManager.pushScene(new CityScene(nearestCity));
    }

    if (GameState.truck.battery <= 0 && !this.noBatteryTimer.isActive()) {
      this.noBatteryTimer.set(3000);
    }

    if (this.noBatteryTimer.check()) {
      this.noBatteryNeedsToBeTeleported = true;
      SceneManager.pushScene(new DialogBoxScene("You've ran out of battery.\nYou will be transported\nto the nearest city."));
    }

    if (Input.getKeyDown('KeyE')) {
      for (let idx = 0; idx < GameState.world.cities.length; idx += 1) {
        const c = GameState.world.cities[idx];
        const dst = Vector2.sqrDistance(c.position, GameState.truck.position);
        if (dst < 5) {
          SceneManager.pushScene(new CityScene(c));
        }
      }
    }

    this.drawChargingCost = false;
    let nearCharger = false;

    for (let idx = 0; idx < GameState.world.chargers.length; idx += 1) {
      const c = GameState.world.chargers[idx];
      const dst = Vector2.sqrDistance(c.position, GameState.truck.position);
      if (dst < 5) {
        this.drawChargingCost = true;
        nearCharger = true;

        if (GameState.truck.batteryPercent < 1.0 && Input.getKey('KeyE')) {
          if (GameState.cash >= CHARGE_PRICE) {
            GameState.truck.charge();
            if (!this.chargingSound) {
              this.chargingSound = SoundPlayer.playSound('charging', true, 0.4);
            }
            this.chargingCost += CHARGE_PRICE;
            GameState.cash -= CHARGE_PRICE;
          }
        } else {
          if (this.chargingSound) {
            SoundPlayer.stopSound(this.chargingSound);
            this.chargingSound = null;
          }
        }
      }
    }

    if (!nearCharger) {
      this.chargingCost = 0;
      if (this.chargingSound) {
        SoundPlayer.stopSound(this.chargingSound);
        this.chargingSound = null;
      }
    }
  }

  render(scr: Screen): void {
    scr.clearScreen();

    this.camera.begin();

    // Map
    scr.drawTexture(GameState.world.topoTexture, 0, 0);
    scr.drawTexture(GameState.world.topoLinesTexture, 0, 0);
    scr.drawTexture(GameState.world.roadPathTexture, 0, 0);

    // Chargers
    for (let i = 0; i < GameState.world.chargers.length; i += 1) {
      const c = GameState.world.chargers[i];
      scr.color(ENDESGA16PaletteIdx[15]);
      scr.fillRect(c.position.x - 3, c.position.y - 3, 6, 6);
      scr.color(ENDESGA16PaletteIdx[14]);
      scr.fillRect(c.position.x - 2, c.position.y - 2, 4, 4);
    }

    // Fog layer
    scr._ctx.drawImage(GameState.world.fogScreen._domElement, 0, 0);

    // Cities
    for (let i = 0; i < GameState.world.cities.length; i += 1) {
      const c = GameState.world.cities[i];

      if (GameState.visitedCityIds.includes(c.id)) {
        scr.color(ENDESGA16PaletteIdx[4]);
        scr.fillRect(c.position.x - 3, c.position.y - 3, 6, 6);
      }

      scr.color(ENDESGA16PaletteIdx[5]);
      scr.fillRect(c.position.x - 2, c.position.y - 2, 4, 4);
    }

    // Trucks
    GameState.truck.render(scr);

    // City names
    for (let i = 0; i < GameState.world.cities.length; i += 1) {
      const c = GameState.world.cities[i];
      const x = c.position.x + 1;
      const y = c.position.y + 2;
      scr.drawText(c.name, x + 1, y + 1, Color.black);
      scr.drawText(c.name, x, y, Color.white);
    }

    this.camera.end();

    // Time
    scr.drawText(formattedCalendarTime(), 5, 5, Color.white);

    // Battery indicator
    scr.drawTexture(this.batteryTexture, 5, 15);
    scr.color(GameState.truck.batteryPercent <= 0.2 ? ENDESGA16PaletteIdx[4] : ENDESGA16PaletteIdx[15]);
    scr.fillRect(8, 18, 24 * GameState.truck.batteryPercent, 11);
    scr.drawText(`${(GameState.truck.batteryPercent * 100) | 0}%`.padStart(4, ' '), 37, 20, Color.white);

    // Charging cost
    if (this.drawChargingCost) {
      const notEnoughCashText = GameState.cash < CHARGE_PRICE ? ' Not enough money to charge' : '';
      scr.drawText(`-$${this.chargingCost | 0}${notEnoughCashText}`, 76, 20, Color.white);
    }
  }
}
