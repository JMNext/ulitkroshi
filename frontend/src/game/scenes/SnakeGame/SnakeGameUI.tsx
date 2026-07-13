import React, { useState, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import * as Phaser from 'phaser';
import { GameHeaderUI } from '../../../ui/components/GameHeaderUI';
import { MobileControlsUI } from '../../../ui/components/MobileControls';
// @ts-ignore
import { animateCoinExplosion, createBaseGameOverModal } from '../../../ui/components/GameOverModalUI';

let root: Root | null = null;
let trigAnim: (() => void) | null = null;
let updScore: ((s: number) => void) | null = null;

export const FRUITS = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];
const SNAKE_COLOR = 0x61aa05;

export interface SnakeUiMetrics { gridSize: number; offsetX: number; offsetY: number; }

export const destroySnakeUI = (): void => {
  if (root) { root.unmount(); root = null; }
  document.getElementById('snake-ui-overlay')?.remove();
  trigAnim = null; updScore = null;
};

const MemoryUI = ({ onBack, scene }: { onBack: () => void; scene: any }) => {
  const [score, setScore] = useState(0);
  const [isWash, setIsWash] = useState(false);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const vIdle = useRef<HTMLVideoElement | null>(null);
  const vPlay = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    updScore = setScore;
    trigAnim = () => { try { vIdle.current?.pause(); } catch (e) {} setIsWash(true); vPlay.current?.play().catch(() => {}); };
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => { updScore = null; trigAnim = null; window.removeEventListener('resize', onResize); };
  }, []);

  const isPort = dims.w < dims.h;
  const size = Math.max(20, Math.min(32, Math.floor((dims.w * 0.85) / 12)));
  const gridOffsetY = Math.floor((dims.h - (12 * size)) / 2) - (isPort ? 35 : 0);
  const petSize = isPort ? Math.max(100, Math.min(180, Math.floor(gridOffsetY * 0.55))) : 240;

  const petStyle: React.CSSProperties = isPort 
    ? { position: 'absolute', insetInline: 0, bottom: `${dims.h - gridOffsetY + 10}px`, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 40 }
    : { position: 'absolute', left: 'calc(20vw - 100px)', bottom: '50px', display: 'flex', alignItems: 'flex-end', zIndex: 40 };

  const ctrlStyle: React.CSSProperties = isPort
    ? { position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: '30px', zIndex: 50 }
    : { position: 'fixed', right: '80px', bottom: '40px', zIndex: 50 };

  return (
    <>
      <GameHeaderUI score={score} onBack={onBack} />
      <div style={petStyle} className="pointer-events-auto">
        <div className="relative object-contain" style={isPort ? { width: `${petSize}px`, height: `${petSize}px` } : undefined}>
          {!isPort && <div className="relative w-[30vw] h-[30vw] min-w-[200px] max-w-[280px]" />}
          <video ref={vIdle} src="/assets/resources/1stpet-animation/prostoi-converted.webm" muted playsInline autoPlay loop className="absolute inset-0 w-full h-full object-contain" style={{ display: isWash ? 'none' : 'block' }} />
          <video ref={vPlay} src="/assets/resources/1stpet-animation/play-converted.webm" muted playsInline onEnded={() => { setIsWash(false); vIdle.current?.play().catch(() => {}); }} className="absolute inset-0 w-full h-full object-contain" style={{ display: isWash ? 'block' : 'none' }} />
        </div>
      </div>
      <div style={ctrlStyle} className="pointer-events-auto">
        <MobileControlsUI type="cross" onChangeDir={(dir) => scene && typeof scene.changeDirection === 'function' && scene.changeDirection(dir)} />
      </div>
    </>
  );
};

export const renderSnakeUI = (scene: any, onBackClick: () => void): void => {
  destroySnakeUI();
  const el = document.createElement('div');
  el.id = 'snake-ui-overlay'; 
  el.className = 'absolute inset-0 pointer-events-none z-30';
  document.getElementById('game-container')?.appendChild(el);
  root = createRoot(el);
  root.render(<MemoryUI onBack={onBackClick} scene={scene} />);
};

export const playPetGamerMatchAnim = (): void => trigAnim?.();
export const updateSnakeScoreUI = (score: number): void => updScore?.(score);
export const createSnakeBackground = (scene: Phaser.Scene): void => { scene.add.image(scene.scale.width / 2, scene.scale.height / 2, 'bg-jungli').setDisplaySize(scene.scale.width, scene.scale.height).setDepth(0); };

export const showSnakeGameOver = (scene: Phaser.Scene, score: number, isWin: boolean, onBack: () => void, onRestart: () => void): void => {
  scene.time.delayedCall(isWin ? 1200 : 0, () => createBaseGameOverModal(scene, { title: isWin ? 'ПОБЕДА!' : 'ИГРА ОКОНЧЕНА', resultLabel: 'СЧЕТ', score, buttonText: 'В МЕНЮ', isWin, onBack, onRestart }));
};

export const drawHeartsUI = (scene: any): void => {
  if (scene.heartsGroup) scene.heartsGroup.forEach((h: any) => h?.destroy());
  scene.heartsGroup = [];
  const isPort = scene.scale.width < scene.scale.height, startX = isPort ? 24 : 70, startY = isPort ? 110 : 130, spacing = isPort ? 32 : 40, size = isPort ? 28 : 36;
  for (let i = 0; i < Math.ceil(scene.hp / 25); i++) {
    scene.heartsGroup.push(scene.add.image(startX + i * spacing, startY, 'icon-life').setDisplaySize(size, size).setOrigin(0, 0.5).setDepth(20));
  }
};

export const calculateGridMetricsUI = (scene: Phaser.Scene): SnakeUiMetrics => {
  const w = window.innerWidth, h = window.innerHeight, isPort = w < h;
  const size = isPort ? Math.max(20, Math.min(32, Math.floor((w * 0.85) / 12))) : Math.max(24, Math.min(60, Math.floor((w * 0.6) / 12), Math.floor((h * 0.75) / 12)));
  return { gridSize: size, offsetX: Math.floor((w - 12 * size) / 2), offsetY: Math.floor((h - (12 * size)) / 2) - (isPort ? 35 : 0) };
};

export const buildPlayGridUI = (scene: Phaser.Scene, minX: number, maxX: number, minY: number, maxY: number, metrics: SnakeUiMetrics): void => {
  const g = scene.add.graphics().setDepth(2), { gridSize: size, offsetX: ox, offsetY: oy } = metrics;
  const sX = ox + minX * size, sY = oy + minY * size, w = (maxX - minX + 1) * size, h = (maxY - minY + 1) * size, r = Math.min(24, size * 0.4);
  g.fillStyle(0xffffff, 0.4).fillRoundedRect(sX, sY, w, h, r).lineStyle(2, 0x000000, 0.2);
  for (let x = minX + 1; x <= maxX; x++) { g.moveTo(ox + x * size, sY); g.lineTo(ox + x * size, sY + h); }
  for (let y = minY + 1; y <= maxY; y++) { g.moveTo(sX, oy + y * size); g.lineTo(sX + w, oy + y * size); }
  g.strokePath().lineStyle(Math.max(3, size * 0.1), SNAKE_COLOR, 1).strokeRoundedRect(sX, sY, w, h, r);
};

export const drawSnakeSegmentUI = (scene: Phaser.Scene, x: number, y: number, gridSize: number, isHead = false, dir = 'RIGHT'): Phaser.GameObjects.Graphics => {
  const g = scene.add.graphics().fillStyle(SNAKE_COLOR, 1).fillRoundedRect(0, 0, gridSize - 4, gridSize - 4, gridSize * 0.2).setPosition(x, y).setDepth(5);
  if (isHead) {
    g.fillStyle(0x000000, 1);
    const s = gridSize - 4, er = Math.max(2, gridSize * 0.06), f = s * 0.75, n = s * 0.25;
    const eyes: Record<string, number[]> = { RIGHT: [f, n, f, f], LEFT: [n, n, n, f], UP: [n, n, f, n], DOWN: [n, f, f, f] };
    const [e1x, e1y, e2x, e2y] = eyes[dir] || [f, n, f, f];
    g.fillCircle(e1x, e1y, er).fillCircle(e2x, e2y, er);
  }
  return g;
};

export const spawnSnakeFruitUI = (scene: any, metrics: SnakeUiMetrics, snake: { x: number; y: number }[]): void => {
  if (scene.fruit) { scene.fruit.destroy(); scene.fruit = null; }
  let lx = 0, ly = 0;
  do {
    lx = Phaser.Math.Between(scene.minGridX, scene.maxGridX); ly = Phaser.Math.Between(scene.minGridY, scene.maxGridY);
  } while (snake.some(s => s.x === lx && s.y === ly));
  scene.fruit = Object.assign(scene.add.image(metrics.offsetX + lx * metrics.gridSize + metrics.gridSize / 2, metrics.offsetY + ly * metrics.gridSize + metrics.gridSize / 2, `fruit-${FRUITS[Math.floor(Math.random() * FRUITS.length)]}`), { gridX: lx, gridY: ly }).setDisplaySize(metrics.gridSize - 6, metrics.gridSize - 6).setDepth(4);
};
