import { AssetDefinition, Assets, Ponczek, STARTUP_SKIP_SPLASH_SCREEN } from 'ponczek';
import { InitScene } from 'ludum-dare-54/scenes/init-scene';
import textureList from '../assets/textures.json';
import soundList from '../assets/sounds.json';

(async function main(): Promise<void> {
  await Assets.loadAssets(textureList as AssetDefinition[], soundList as AssetDefinition[]);
  await Ponczek.initialize(
    320 * 1,
    240 * 1,
    () => new InitScene(),
    STARTUP_SKIP_SPLASH_SCREEN,
  );
}());
