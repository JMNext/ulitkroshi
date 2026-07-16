import * as Phaser from 'phaser';
import { MemoryCardContainer, MemoryConfig } from '../MemoryGameScene';
import { createMemoryCard } from '../components/MemoryCard';

export const buildCardsGridUI = (scene: Phaser.Scene, deck: string[], cfg: MemoryConfig, onClick: (card: MemoryCardContainer) => void): MemoryCardContainer[] => {
  const w = scene.scale.gameSize.width;
  const h = scene.scale.gameSize.height;
  const { rows, cols } = cfg;
  const isPort = w < h;

  const anchor = document.querySelector('.memory-grid-visual-anchor');
  
  const maxGridW = anchor ? anchor.clientWidth : (isPort ? Math.floor(w * 0.75) : Math.floor(w * 0.55));
  const maxGridH = anchor ? anchor.clientHeight : (isPort ? Math.floor(h * 0.40) : Math.floor(h * 0.58));

  const size = Math.min(Math.floor(maxGridW / cols), Math.floor(maxGridH / rows));
  const gapFactor = cols <= 4 ? 0.07 : cols <= 6 ? 0.05 : 0.04;
  const gap = Math.max(2, Math.floor(size * gapFactor));
  const innerSize = size - gap;
  
  const totalGridW = cols * innerSize + (cols - 1) * gap;
  const totalGridH = rows * innerSize + (rows - 1) * gap;

  const sX = (w - totalGridW) / 2 + innerSize / 2;
  const sY = (h - totalGridH) / 2 + innerSize / 2;

  return deck.map((id, i) => {
    const cardX = sX + (i % cols) * (innerSize + gap);
    const cardY = sY + Math.floor(i / cols) * (innerSize + gap);
    return createMemoryCard(scene, id, cardX, cardY, innerSize, onClick);
  });
};

export const animateCardFlipUI = (scene: Phaser.Scene, card: MemoryCardContainer, show: boolean, onComplete: (() => void) | null) => {
  if (!card || !card.scene) return onComplete?.();
  scene.tweens.add({ 
    targets: card, 
    scaleX: 0, 
    duration: 150, 
    yoyo: true, 
    onYoyo: () => { 
      if (card.shirtImg?.active) card.shirtImg.setAlpha(show ? 0 : 1); 
      if (card.fruitImg?.active) card.fruitImg.setAlpha(show ? 1 : 0); 
      card.isFaceUp = show; 
    }, 
    onComplete: onComplete || undefined 
  });
};

export const animateMassShuffleUI = (scene: Phaser.Scene, cards: MemoryCardContainer[], onComplete: () => void) => {
  const active = cards.filter(c => c?.scene && c.active);
  if (active.length <= 1) return onComplete();
  const pos = active.map(c => ({ x: c.x, y: c.y })).sort(() => Math.random() - 0.5);
  let done = 0;
  active.forEach((card, idx) => {
    if (card && card.scene) {
      scene.tweens.add({ 
        targets: card, 
        x: pos[idx].x, 
        y: pos[idx].y, 
        duration: 750, 
        ease: 'Cubic.out', 
        onComplete: () => { if (++done === active.length) onComplete(); } 
      });
    }
  });
};
