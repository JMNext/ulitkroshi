import * as Phaser from 'phaser';
import { MemoryCardContainer, MemoryConfig } from '../MemoryGameScene';
import { getSharedMemoryGridConfig } from '../components/MemoryUiContainer';
import { createMemoryCard } from '../components/MemoryCard';

export const buildCardsGridUI = (scene: Phaser.Scene, deck: string[], cfg: MemoryConfig, onClick: (card: MemoryCardContainer) => void): MemoryCardContainer[] => {
  const { width: w, height: h } = scene.scale;
  const { rows, cols } = cfg;
  const gridCfg = getSharedMemoryGridConfig(w, h);

  // Высчитываем размер стороны карточки так, чтобы она оставалась строго КВАДРАТНОЙ
  const size = Math.min(Math.floor(gridCfg.maxGridW / cols), Math.floor(gridCfg.maxGridH / rows));
  const gap = Math.max(2, Math.floor(size * 0.08));
  const innerSize = size - gap;
  
  const totalGridW = cols * innerSize + (cols - 1) * gap;
  const totalGridH = rows * innerSize + (rows - 1) * gap;

  // Центрируем сетку карточек по горизонтали и вертикали
  const sX = (w - totalGridW) / 2 + innerSize / 2;
  const sY = w < h 
    ? gridCfg.topOffset + (gridCfg.maxGridH - totalGridH) / 2 + innerSize / 2 
    : (h - totalGridH) / 2 + innerSize / 2;

  return deck.map((id, i) => {
    // ИСПРАВЛЕНО: Индексы рядов и колонок теперь строго привязаны к динамическому cols из конфига сложности
    const cardX = sX + (i % cols) * (innerSize + gap);
    const cardY = sY + Math.floor(i / cols) * (innerSize + gap);
    return createMemoryCard(scene, id, cardX, cardY, innerSize, onClick);
  });
};

export const animateCardFlipUI = (scene: Phaser.Scene, card: MemoryCardContainer, show: boolean, onComplete: (() => void) | null) => {
  scene.tweens.add({ targets: card, scaleX: 0, duration: 150, yoyo: true, onYoyo: () => { card.shirtImg.setAlpha(show ? 0 : 1); card.fruitImg.setAlpha(show ? 1 : 0); card.isFaceUp = show; }, onComplete: onComplete || undefined });
};

export const animateMassShuffleUI = (scene: Phaser.Scene, cards: MemoryCardContainer[], onComplete: () => void) => {
  const active = cards.filter(c => c?.scene && c.active);
  if (active.length <= 1) return onComplete();
  const pos = active.map(c => ({ x: c.x, y: c.y })).sort(() => Math.random() - 0.5);
  let done = 0;
  active.forEach((card, idx) => scene.tweens.add({ targets: card, x: pos[idx].x, y: pos[idx].y, duration: 750, ease: 'Cubic.out', onComplete: () => { if (++done === active.length) onComplete(); } }));
};
