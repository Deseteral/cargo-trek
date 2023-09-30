import { AssetDefinition, Assets, Ponczek, Random, STARTUP_AUTOPLAY, STARTUP_SKIP_SPLASH_SCREEN, Vector2 } from 'ponczek';
import { OverworldScene } from 'ludum-dare-54/scenes/overworld-scene';
import { GameState } from 'ludum-dare-54/game/game-state';
import { CargoScene } from 'ludum-dare-54/scenes/cargo-scene';
import textureList from '../assets/textures.json';
import soundList from '../assets/sounds.json';

(async function main(): Promise<void> {
  await Assets.loadAssets(textureList as AssetDefinition[], soundList as AssetDefinition[]);

  GameState.create(Random.default.nextInt(0, 9999));

  await Ponczek.initialize(
    320 * 1,
    240 * 1,
    () => new CargoScene(),
    STARTUP_SKIP_SPLASH_SCREEN | STARTUP_AUTOPLAY,
  );
}());
