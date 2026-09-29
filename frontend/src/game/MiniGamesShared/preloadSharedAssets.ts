import Phaser from "phaser";
import { SHARED_GAME_ASSETS } from "./miniGames.constants";

export const preloadSharedAssets = (scene: Phaser.Scene, bgKeyPrefix: string, includeShirt = false) => {
  scene.load.image(`${bgKeyPrefix}_bg_horiz`, SHARED_GAME_ASSETS.bgHoriz);
  scene.load.image(`${bgKeyPrefix}_bg_vert`, SHARED_GAME_ASSETS.bgVert);
  if (includeShirt) scene.load.image("card_shirt", SHARED_GAME_ASSETS.cardShirt);

  Object.entries(SHARED_GAME_ASSETS.fruits).forEach(([k, v]) => {
    if (!scene.textures.exists(k)) scene.load.image(k, v);
  });
};
