import * as Phaser from 'phaser';
import { MemoryCardContainer } from '../MemoryGameScene';

export const createMemoryCard = (
  scene: Phaser.Scene,
  id: string,
  x: number,
  y: number,
  innerSize: number,
  onClick: (card: MemoryCardContainer) => void
): MemoryCardContainer => {
  const container = scene.add.container(x, y).setDepth(5) as MemoryCardContainer;
  
  const fImg = scene.add.image(0, 0, `fruit-${id}`).setDisplaySize(innerSize * 0.65, innerSize * 0.65).setAlpha(0);
  const sImg = scene.add.image(0, 0, 'card-back').setDisplaySize(innerSize * 0.65, innerSize * 0.65);
  
  const br = Math.max(3, Math.floor(innerSize * 0.14));
  const bt = Math.max(1, Math.floor(innerSize * 0.04));
  const g = scene.add.graphics()
    .fillStyle(0xffffff, 1)
    .fillRoundedRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize, br)
    .lineStyle(bt, 0xf2eee6, 1)
    .strokeRoundedRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize, br);
  
  container.add([g, fImg, sImg]);
  Object.assign(container, { fruitKey: id, fruitImg: fImg, shirtImg: sImg, isFaceUp: false });
  
  container.setInteractive(new Phaser.Geom.Rectangle(-innerSize / 2, -innerSize / 2, innerSize, innerSize), Phaser.Geom.Rectangle.Contains)
    .on('pointerdown', () => onClick(container));
    
  return container;
};
