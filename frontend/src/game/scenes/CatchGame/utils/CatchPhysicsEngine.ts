import * as Phaser from 'phaser';
import { checkFruitCaughtLogic } from '../CatchGameLogic';
import { CatchUiMetrics, drawHeartsUI, ICatchGameScene } from './CatchPhaserRender';

export interface IFruitImage extends Phaser.GameObjects.Image {
  isHeart?: boolean;
}

export const spawnItem = (scene: ICatchGameScene, key: string, size: number, isHeart = false): void => {
  if (scene.isGameOver) return;
  
  const pad = size + 20;
  const item = scene.add.image(
    Phaser.Math.Between(pad, scene.scale.width - pad), 
    -size, 
    key
  ).setDisplaySize(size, size).setDepth(4) as IFruitImage;

  if (isHeart) {
    item.isHeart = true;
  }
  
  scene.fruitsGroup.push(item);
};

export const updateItemsPhysics = (
  scene: ICatchGameScene, 
  w: number, 
  h: number, 
  metrics: CatchUiMetrics, 
  onWin: () => void, 
  onLose: () => void
): void => {
  const speedMultiplier = w < h ? (h / 1920) * 1.6 : h / 1080;
  const fallSpeed = Math.max(4, scene.fruitSpeed * speedMultiplier);

  scene.fruitsGroup = scene.fruitsGroup.filter((f: IFruitImage) => {
    if (!f.active) return false;
    
    f.y += fallSpeed;
    
    if (checkFruitCaughtLogic(f.x, f.y, scene.player.x, scene.player.y, metrics.catchRadius)) {
      f.destroy();
      if (f.isHeart) {
        scene.hp = Math.min(100, scene.hp + 25); 
        drawHeartsUI(scene);
      } else {
        scene.score++;
        if (scene.score >= 20) {
          onWin();
        } else if (scene.score % 10 === 0) {
          scene.fruitSpeed += scene.difficulty === 'easy' ? 0.8 : 1.5;
        }
      }
      return false;
    }
    
    if (f.y > scene.player.y + 80) {
      f.destroy();
      if (!f.isHeart) {
        scene.hp -= 25;
        drawHeartsUI(scene);
        if (scene.hp <= 0) onLose();
      }
      return false;
    }
    
    return true;
  });
};
