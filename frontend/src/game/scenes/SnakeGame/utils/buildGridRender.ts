import { buildGridGfx, drawSegmentGfx } from './SnakePhaserRenderer';
import { drawHeartsRender } from './drawHeartsRender';
import { spawnFruitRender } from './spawnFruitRender';

export const buildGridRender = (scene: any): void => {
  scene.gridGfx?.destroy();
  scene.gridGfx = buildGridGfx(scene, scene.m.offsetX, scene.m.offsetY, scene.m.gridSize);
  drawHeartsRender(scene);
  scene.visualSnake.forEach((s: any) => s?.destroy());
  scene.visualSnake = scene.sState.snake.map((pt: any, i: number) =>
    drawSegmentGfx(scene, scene.m.offsetX, scene.m.offsetY, scene.m.gridSize, pt.x, pt.y, i === 0, scene.sState.dir)
  );
  spawnFruitRender(scene);
};
