import { GameState } from 'ludum-dare-54/game/game-state';
import { formattedCalendarTime } from 'ludum-dare-54/game/world-time';
import { drawCursor } from 'ludum-dare-54/gfx/cursor';
import { DialogBox } from 'ludum-dare-54/gfx/dialog-box';
import { CityScene } from 'ludum-dare-54/scenes/city-scene';
import { DialogBoxScene } from 'ludum-dare-54/scenes/dialog-box-scene';
import { OverworldPauseScene } from 'ludum-dare-54/scenes/overworld-pause-scene';
import { Scene, Screen, Vector2, Camera, Input, ENDESGA16PaletteIdx, Color, SceneManager, Timer, Texture, Assets, SoundPlayer, SoundPlaybackId, Random, Ponczek } from 'ponczek';

const UNTIL_NEXT_MINUTE_MS = 1;
const CHARGE_PRICE = 0.2;

interface Cloud {
  position: Vector2,
  speed: Vector2,
  scale: number,
  flip: number,
}

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

  backgroundMusic: (SoundPlaybackId | null) = null;

  cloudTexture: Texture;
  clouds: Cloud[];

  nearbyText: (string | null) = null;

  constructor() {
    super();
    this.camera = new Camera();
    this.lookAtTruck();

    this.worldTimeProgressionTimer = new Timer();
    this.worldTimeProgressionTimer.set(UNTIL_NEXT_MINUTE_MS);

    this.batteryTexture = Assets.texture('battery');

    this.backgroundMusic = SoundPlayer.playSound('overworld_m', true);

    this.cloudTexture = Assets.texture('cloud');
    this.clouds = [];
    for (let i = 0; i < 130; i += 1) {
      const x = Random.default.nextInt(0, GameState.world.mapSize);
      const y = Random.default.nextInt(0, GameState.world.mapSize);
      const scale = Random.default.nextFloat(0.25, 2);
      const flip = Random.default.nextInt(0, 3);
      const speed = Vector2.right().mul(Random.default.nextFloat(0.01, 0.04));
      this.clouds.push({ position: new Vector2(x, y), speed, scale, flip });
    }
  }

  lookAtTruck(): void {
    this.camera.lookAt(GameState.truck.position);
  }

  update(): void {
    this.nearbyText = '';

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
    if (Input.getKeyDown('KeyQ')) this.lookAtTruck();

    this.camera.position.x = Math.clamp(this.camera.position.x, (Ponczek.screen.width / 2), GameState.world.mapSize - (Ponczek.screen.width / 2));
    this.camera.position.y = Math.clamp(this.camera.position.y, (Ponczek.screen.height / 2), GameState.world.mapSize - (Ponczek.screen.height / 2));

    this.camera.screenToWorld(Input.pointer, this.mouseInWorld);

    if (Input.pointerLeftPressed) {
      GameState.truck.driveTowards(this.mouseInWorld);
    } else {
      GameState.truck.stopDriving();
    }

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
      this.lookAtTruck();
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

    for (let idx = 0; idx < GameState.world.cities.length; idx += 1) {
      const c = GameState.world.cities[idx];
      const dst = Vector2.sqrDistance(c.position, GameState.truck.position);
      if (dst < 5) {
        this.nearbyText = 'Press E to enter town';

        if (Input.getKeyDown('KeyE')) {
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
        this.nearbyText = 'Press E to charge';

        if (GameState.truck.batteryPercent < 1.0 && Input.getKey('KeyE')) {
          if (GameState.cash >= CHARGE_PRICE) {
            GameState.truck.charge();

            if (!GameState.visitedChargerIds.includes(c.id)) {
              GameState.visitedChargerIds.push(c.id);
            }

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

    for (let idx = 0; idx < this.clouds.length; idx += 1) {
      const cpos = this.clouds[idx].position;
      cpos.add(this.clouds[idx].speed);
      if (cpos.x > GameState.world.mapSize) cpos.x = -(this.cloudTexture.width * this.clouds[idx].scale);
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

      if (GameState.visitedChargerIds.includes(c.id)) {
        scr.color(ENDESGA16PaletteIdx[15]);
        scr.fillRect(c.position.x - 3, c.position.y - 3, 6, 6);
      }

      scr.color(ENDESGA16PaletteIdx[14]);
      scr.fillRect(c.position.x - 2, c.position.y - 2, 4, 4);
    }

    // Clouds
    for (let idx = 0; idx < this.clouds.length; idx += 1) {
      const c = this.clouds[idx];
      scr.drawTexture(this.cloudTexture, c.position.x, c.position.y, this.cloudTexture.width * c.scale, this.cloudTexture.height * c.scale, c.flip);
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

    // Truck
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

    // Top frame
    DialogBox.drawFrame(-5, -5, 115, 35, scr);

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

    // Nearby text
    if (this.nearbyText) {
      DialogBox.drawFrame(-5, scr.height - 12, this.nearbyText.length * scr.activeFont!.charWidth + 8, 15, scr);
      scr.drawText(this.nearbyText, 2, scr.height - 12, Color.white);
    }

    // Cursor pointer
    drawCursor(scr);
  }
}
