import React, { useState, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import * as Phaser from 'phaser';
import { GameHeaderUI } from '../../../ui/components/GameHeaderUI';
import { MemoryCardContainer, MemoryConfig } from './MemoryGameScene';

let root: Root | null = null;
let trigAnim: (() => void) | null = null;
let updScore: ((s: number) => void) | null = null;

export const FRUITS = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];

export const destroyMemoryUI = (): void => {
  if (root) {
    root.unmount();
    root = null;
  }
  document.getElementById('memory-ui-overlay')?.remove();
  trigAnim = null;
  updScore = null;
};

const MemoryUI = ({ onBack }: { onBack: () => void }) => {
  const [score, setScore] = useState(0);
  const [isWash, setIsWash] = useState(false);
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
  const vIdle = useRef<HTMLVideoElement | null>(null);
  const vPlay = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    updScore = setScore;
    trigAnim = () => {
      try { vIdle.current?.pause(); } catch (e) {}
      setIsWash(true);
      vPlay.current?.play().catch(() => {});
    };
    
    const handleWindowResize = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleWindowResize);

    return () => { 
      updScore = null; 
      trigAnim = null; 
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const isPort = dimensions.w < dimensions.h;
  const cols = 4;
  const rows = 4;
  const topOffset = isPort ? Math.floor(dimensions.h * 0.15) : 10;
  const maxGridH = isPort ? Math.floor(dimensions.h * 0.52) : Math.floor(dimensions.h * 0.8);
  const maxGridW = isPort ? Math.floor(dimensions.w * 0.92) : Math.floor(dimensions.w * 0.6);
  
  const size = Math.min(Math.floor(maxGridW / cols), Math.floor(maxGridH / rows));
  const gridHeight = rows * size;
  const startY = isPort ? topOffset + (maxGridH - gridHeight) / 2 : (dimensions.h - gridHeight) / 2;
  const gridBottomY = startY + gridHeight;

  const dynamicPetSize = isPort ? Math.max(140, Math.min(240, Math.floor(dimensions.h * 0.18))) : 240;

  const petContainerStyle: React.CSSProperties = isPort ? {
    position: 'absolute',
    insetInline: 0,
    bottom: 'unset',
    top: `${gridBottomY + 15}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 40
  } : {
    position: 'absolute',
    left: 'calc(20vw - 100px)',
    top: 'unset', 
    bottom: '50px',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 40
  };

  const petSizeStyle: React.CSSProperties = isPort ? {
    width: `${dynamicPetSize}px`,
    height: `${dynamicPetSize}px`
  } : {
    width: '30vw',
    height: '30vw',
    minWidth: '200px',
    maxWidth: '280px'
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      <GameHeaderUI score={score} onBack={onBack} />
      <div style={petContainerStyle} className="pointer-events-auto">
        <div className="relative object-contain" style={petSizeStyle}>
          <video ref={vIdle} src="/assets/resources/1stpet-animation/prostoi-converted.webm" muted playsInline autoPlay loop className={`absolute inset-0 w-full h-full object-contain ${isWash ? 'hidden' : 'block'}`} />
          <video ref={vPlay} src="/assets/resources/1stpet-animation/play-converted.webm" muted playsInline onEnded={() => { setIsWash(false); vIdle.current?.play().catch(() => {}); }} className={`absolute inset-0 w-full h-full object-contain ${isWash ? 'block' : 'hidden'}`} />
        </div>
      </div>
    </div>
  );
};

export const renderMemoryUI = (onBack: () => void): void => {
  destroyMemoryUI();
  const el = document.createElement('div');
  el.id = 'memory-ui-overlay';
  el.className = 'absolute inset-0 pointer-events-none z-30';
  document.getElementById('game-container')?.appendChild(el);
  root = createRoot(el);
  root.render(<MemoryUI onBack={onBack} />);
};

export const playPetGamerMatchAnim = (): void => trigAnim?.();
export const updateMemoryScoreUI = (score: number): void => updScore?.(score);

export const buildCardsGridUI = (scene: Phaser.Scene, deck: string[], cfg: MemoryConfig, onClick: (card: MemoryCardContainer) => void): MemoryCardContainer[] => {
  const { width: w, height: h } = scene.scale;
  const isPort = w < h;
  const { rows, cols } = cfg;
  
  const topOffset = isPort ? Math.floor(h * 0.15) : 10;
  const maxGridH = isPort ? Math.floor(h * 0.52) : Math.floor(h * 0.8);
  const maxGridW = isPort ? Math.floor(w * 0.92) : Math.floor(w * 0.6);

  const size = Math.min(Math.floor(maxGridW / cols), Math.floor(maxGridH / rows));
  const gap = Math.max(2, Math.floor(size * 0.08));
  const innerSize = size - gap;

  const totalGridW = cols * innerSize + (cols - 1) * gap;
  const totalGridH = rows * innerSize + (rows - 1) * gap;

  const startX = (w - totalGridW) / 2 + innerSize / 2;
  const startY = isPort ? topOffset + (maxGridH - totalGridH) / 2 + innerSize / 2 : (h - totalGridH) / 2 + innerSize / 2;

  return deck.map((id, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const container = scene.add.container(startX + c * (innerSize + gap), startY + r * (innerSize + gap)).setDepth(5) as MemoryCardContainer;
    
    const fImg = scene.add.image(0, 0, `fruit-${id}`).setDisplaySize(innerSize * 0.65, innerSize * 0.65).setAlpha(0);
    const sImg = scene.add.image(0, 0, 'card-back').setDisplaySize(innerSize * 0.65, innerSize * 0.65);
    
    const br = Math.max(3, Math.floor(innerSize * 0.14));
    const bt = Math.max(1, Math.floor(innerSize * 0.04));
    const g = scene.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize, br).lineStyle(bt, 0xf2eee6, 1).strokeRoundedRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize, br);
    
    container.add([g, fImg, sImg]);
    Object.assign(container, { fruitKey: id, fruitImg: fImg, shirtImg: sImg, isFaceUp: false });
    container.setInteractive(new Phaser.Geom.Rectangle(-innerSize / 2, -innerSize / 2, innerSize, innerSize), Phaser.Geom.Rectangle.Contains).setInteractive({ useHandCursor: true }).on('pointerdown', () => onClick(container));
    return container;
  });
};

export const animateCardFlipUI = (scene: Phaser.Scene, card: MemoryCardContainer, show: boolean, onComplete: (() => void) | null): void => {
  scene.tweens.add({ 
    targets: card, 
    scaleX: 0, 
    duration: 150, 
    yoyo: true, 
    onYoyo: () => { 
      card.shirtImg.setAlpha(show ? 0 : 1); 
      card.fruitImg.setAlpha(show ? 1 : 0); 
      card.isFaceUp = show; 
    }, 
    onComplete: onComplete || undefined 
  });
};

export const animateIntroCloseUI = (scene: Phaser.Scene, cards: MemoryCardContainer[], onAllClosed: () => void): void => {
  let done = 0;
  cards.forEach(c => c?.scene && animateCardFlipUI(scene, c, false, () => { if (++done === cards.length) onAllClosed(); }));
};

export const animateMassShuffleUI = (scene: Phaser.Scene, cards: MemoryCardContainer[], onComplete: () => void): void => {
  const active = cards.filter(c => c?.scene && c.active);
  if (active.length <= 1) return onComplete();
  const newPositions = active.map(c => ({ x: c.x, y: c.y })).sort(() => Math.random() - 0.5);
  let done = 0;
  active.forEach((card, i) => scene.tweens.add({ targets: card, x: newPositions[i].x, y: newPositions[i].y, duration: 750, ease: 'Cubic.out', onComplete: () => { if (++done === active.length) onComplete(); } }));
};
