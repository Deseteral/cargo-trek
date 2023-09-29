import { AssetDefinition, Assets, Ponczek, STARTUP_AUTOPLAY, STARTUP_SKIP_SPLASH_SCREEN } from 'ponczek';
import { HelloWorldScene } from 'ludum-dare-54/scenes/hello-world-scene';
import textureList from '../assets/textures.json';
import soundList from '../assets/sounds.json';

(async function main(): Promise<void> {
  await Assets.loadAssets(textureList as AssetDefinition[], soundList as AssetDefinition[]);
  await Ponczek.initialize(
    320,
    240,
    () => new HelloWorldScene(),
    STARTUP_SKIP_SPLASH_SCREEN | STARTUP_AUTOPLAY,
  );
}());
