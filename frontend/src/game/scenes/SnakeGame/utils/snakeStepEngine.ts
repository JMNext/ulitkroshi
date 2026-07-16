import { drawSegmentGfx } from './SnakePhaserRenderer';
import { drawHeartsRender } from './drawHeartsRender';
import { spawnFruitRender } from './spawnFruitRender';
import { processSnakeStepLogic } from '../SnakeGameLogic';
import { useSnakeGameStore } from '../useSnakeGameStore';

export const executeSnakeStep = (scene: any): void => {
  const report = processSnakeStepLogic(scene.sState, scene.fruitObj?.gridX ?? -1, scene.fruitObj?.gridY ?? -1);

  const syncToZustand = () => {
    useSnakeGameStore.getState().setGameState(
      scene.sState.score,
      scene.sState.hp,
      scene.sState.isOver,
      scene.petWashState,
      scene.petCrashState
    );
  };

  if (report.isHit) {
    scene.petCrashState = true; 
    syncToZustand(); 
    drawHeartsRender(scene);
    
    if (scene.sState.hp <= 0) { 
      scene.sState.isOver = true; 
      syncToZustand(); 
      return; 
    }

    scene.time.delayedCall(1500, () => {
      scene.petCrashState = false;
      if (!scene.sState.isOver && scene.sState.isPause) {
        scene.sState.isPause = false; 
        scene.moveTimer = scene.time.now + scene.interval;
      }
      syncToZustand();
    });
    return;
  }

  if (scene.visualSnake && scene.visualSnake[0] && typeof scene.visualSnake[0].clear === 'function') {
    scene.visualSnake[0].clear().fillStyle(0x61aa05, 1).fillRoundedRect(0, 0, scene.m.gridSize - 4, scene.m.gridSize - 4, scene.m.gridSize * 0.2);
  }

  scene.visualSnake.unshift(drawSegmentGfx(scene, scene.m.offsetX, scene.m.offsetY, scene.m.gridSize, report.head.x, report.head.y, true, scene.sState.dir));

  if (report.didEat) {
    scene.petWashState = true; 
    if (scene.fruitObj && typeof scene.fruitObj.destroy === 'function') scene.fruitObj.destroy(); 
    scene.fruitObj = null;
    
    if (scene.sState.score >= 20) { 
      scene.sState.isOver = true; 
      syncToZustand(); 
      scene.animateCoins(20); 
      return; 
    } else {
      spawnFruitRender(scene);
    }
    
    scene.time.delayedCall(800, () => {
      scene.petWashState = false;
      syncToZustand();
    });
  } else {
    const tail = scene.visualSnake.pop();
    if (tail && typeof tail.destroy === 'function') tail.destroy();
  }
  
  syncToZustand();
};
