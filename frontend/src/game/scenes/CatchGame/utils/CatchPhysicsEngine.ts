import * as Phaser from 'phaser';
import { checkFruitCaughtLogic } from '../../CatchGame/CatchGameLogic';
import { CatchUiMetrics, drawHeartsUI, ICatchGameScene, FRUITS } from './CatchPhaserRender';

export interface IFruitImage extends Phaser.GameObjects.Image {
  isHeart?: boolean;
}

export const spawnItem = (scene: ICatchGameScene, key: string, size: number, isHeart = false): void => {
  if (scene.isGameOver) return;
  
  console.log(`[Catch Physics Log] Спавн айтема. Ключ: ${key}, Размер: ${size}, Сердце: ${isHeart}`);
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
  console.log('[Catch Physics Log] Текущее число фруктов на сцене:', scene.fruitsGroup.length);
};

export const setupGameTimers = (scene: ICatchGameScene, spawnDelay: number, fruitSize: number): { spawnTimer: Phaser.Time.TimerEvent, healTimer: Phaser.Time.TimerEvent } => {
  console.log(`[Catch Physics Log] Настройка таймеров. Задержка спавна: ${spawnDelay}мс`);
  
  const spawnTimer = scene.time.addEvent({ 
    delay: spawnDelay, 
    loop: true, 
    callback: () => spawnItem(scene, `f-${Phaser.Utils.Array.GetRandom(FRUITS)}`, fruitSize) 
  });
  
  const healTimer = scene.time.addEvent({ 
    delay: 30000, 
    loop: true, 
    callback: () => spawnItem(scene, 'icon-life', fruitSize, true) 
  });

  return { spawnTimer, healTimer };
};

export const updateItemsPhysics = (
  scene: ICatchGameScene, 
  w: number, 
  h: number, 
  metrics: CatchUiMetrics, 
  onWin: () => void, 
  onLose: () => void
): void => {
  if (!scene.player) {
    console.error('[Catch Physics Log] КРИТИЧЕСКАЯ ОШИБКА: Свойство scene.player не найдено в цикле физики!');
    return;
  }

  const speedMultiplier = w < h ? (h / 1920) * 1.6 : h / 1080;
  const fallSpeed = Math.max(4, scene.fruitSpeed * speedMultiplier);

  scene.fruitsGroup = scene.fruitsGroup.filter((f: IFruitImage) => {
    if (!f.active) return false;
    
    f.y += fallSpeed;
    
    if (checkFruitCaughtLogic(f.x, f.y, scene.player.x, scene.player.y, metrics.catchRadius)) {
      console.log('[Catch Physics Log] Фрукт пойман! Счет +1');
      f.destroy();
      if (f.isHeart) {
        scene.hp = Math.min(100, scene.hp + 25); 
        drawHeartsUI(scene);
      } else {
        scene.score++;
        (scene as any).isPetCatching = true;
        if (scene.score >= 20) {
          onWin();
        } else if (scene.score % 10 === 0) {
          scene.fruitSpeed += scene.difficulty === 'easy' ? 0.8 : 1.5;
        }
      }
      return false;
    }
    
    if (f.y > scene.player.y + 80) {
      console.log('[Catch Physics Log] Фрукт упал мимо! ХП -25');
      f.destroy();
      if (!f.isHeart) {
        scene.hp -= 25;
        drawHeartsUI(scene);
        if (scene.hp <= 0) {
          console.log('[Catch Physics Log] ХП на нуле, вызываем Lose...');
          onLose();
        }
      }
      return false;
    }
    
    return true;
  });
};
