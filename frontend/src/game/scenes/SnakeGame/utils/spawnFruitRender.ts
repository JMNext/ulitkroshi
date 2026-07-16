import * as Phaser from 'phaser';

export const spawnFruitRender = (scene: any): void => {
  scene.fruitObj?.destroy();
  const FRUITS = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];
  let lx = 0, ly = 0;
  do {
    lx = Phaser.Math.Between(0, 11); ly = Phaser.Math.Between(0, 11);
  } while (scene.sState.snake.some((s: any) => s.x === lx && s.y === ly));

  const item = scene.add.image(
    scene.m.offsetX + lx * scene.m.gridSize + scene.m.gridSize / 2,
    scene.m.offsetY + ly * scene.m.gridSize + scene.m.gridSize / 2,
    `f-${Phaser.Utils.Array.GetRandom(FRUITS)}`
  ).setDisplaySize(scene.m.gridSize - 6, scene.m.gridSize - 6).setDepth(4) as any;
  
  item.gridX = lx; item.gridY = ly; scene.fruitObj = item;
};
