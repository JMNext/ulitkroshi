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
  
  // Рисуем подложку карточки (белый скругленный квадрат с рамкой)
  const br = Math.max(4, Math.floor(innerSize * 0.12));
  const bt = Math.max(2, Math.floor(innerSize * 0.04));
  const g = scene.add.graphics();
  
  g.fillStyle(0xffffff, 1);
  g.fillRoundedRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize, br);
  g.lineStyle(bt, 0xf2eee6, 1);
  g.strokeRoundedRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize, br);
  
  // Добавляем изображения фрукта и рубашки, выравнивая масштаб под размер карточки
  const fImg = scene.add.image(0, 0, `fruit-${id}`).setDisplaySize(innerSize * 0.7, innerSize * 0.7).setAlpha(0);
  const sImg = scene.add.image(0, 0, 'card-back').setDisplaySize(innerSize * 0.65, innerSize * 0.65);
  
  // Важно: графика g должна идти ПЕРВОЙ, чтобы не перекрыть картинки сверху
  container.add([g, fImg, sImg]);
  Object.assign(container, { fruitKey: id, fruitImg: fImg, shirtImg: sImg, isFaceUp: false });
  
  // Настраиваем точную зону клика по границам карточки
  container.setInteractive(
    new Phaser.Geom.Rectangle(-innerSize / 2, -innerSize / 2, innerSize, innerSize), 
    Phaser.Geom.Rectangle.Contains
  ).on('pointerdown', () => onClick(container));
    
  return container;
};
