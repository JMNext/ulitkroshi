import React, { useState, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import * as Phaser from 'phaser';
import { GameHeaderUI } from '../../../ui/components/GameHeaderUI';
import { MobileControlsUI } from '../../../ui/components/MobileControls';
// @ts-ignore
import { animateCoinExplosion, createBaseGameOverModal } from '../../../ui/components/GameOverModalUI';

let root: Root | null = null;
let updData: ((s: number, h: number) => void) | null = null;

export const FRUITS = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];

export interface CatchUiMetrics { playerScale: number; playerY: number; fruitSize: number; catchRadius: number; }

export const destroyCatchUI = (): void => {
  if (root) { 
    root.unmount(); 
    root = null; 
  }
  document.getElementById('catch-ui-overlay')?.remove();
  updData = null;
};

const CatchUIComponent = ({ scene, onBack }: { scene: any; onBack: () => void }) => {
  const [score, setScore] = useState(0);
  
  useEffect(() => { 
    updData = (s) => setScore(s); 
    return () => { 
      updData = null; 
    }; 
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <GameHeaderUI score={score} onBack={onBack} />
      <div className="pointer-events-auto">
        <MobileControlsUI 
          type="horizontal" 
          onChangeDir={(dir) => {
            if (!scene?.sys?.active) return;
            if (dir === 'LEFT') {
              scene.isPressingUiButton = true;
              scene.moveDirection = -1;
            } else if (dir === 'RIGHT') {
              scene.isPressingUiButton = true;
              scene.moveDirection = 1;
            } else {
              scene.isPressingUiButton = false;
              scene.moveDirection = 0;
            }
          }} 
        />
      </div>
    </div>
  );
};

export const renderCatchUI = (scene: any, onBackClick: () => void): void => {
  destroyCatchUI();
  const el = document.createElement('div');
  el.id = 'catch-ui-overlay';
  el.className = 'absolute inset-0 pointer-events-none z-30';
  document.getElementById('game-container')?.appendChild(el);
  root = createRoot(el);
  root.render(<CatchUIComponent scene={scene} onBack={onBackClick} />);
};

export const updateCatchUIData = (score: number, hp: number): void => updData?.(score, hp);

export const showCatchGameOver = (scene: Phaser.Scene, score: number, isWin: boolean, onBack: () => void, onRestart: () => void): void => {
  scene.time.delayedCall(isWin ? 1200 : 0, () => createBaseGameOverModal(scene, { 
    title: isWin ? 'ПОБЕДА!' : 'ИГРА ОКОНЧЕНА', 
    resultLabel: 'СЧЕТ', 
    score, 
    buttonText: 'В МЕНЮ', 
    isWin, 
    onBack, 
    onRestart 
  }));
};

export const calculateCatchMetricsUI = (scene: Phaser.Scene): CatchUiMetrics => {
  const { width: w, height: h } = scene.scale;
  const isPort = w < h;
  return { 
    playerScale: isPort ? 110 / 644 : 180 / 644, 
    playerY: isPort ? h - 190 : h - 230, 
    fruitSize: isPort ? 55 : 75, 
    catchRadius: isPort ? 55 : 90 
  };
};

export const createPlayerUI = (scene: Phaser.Scene, metrics: CatchUiMetrics): Phaser.GameObjects.Video => {
  const v = scene.add.video(scene.scale.width / 2, metrics.playerY, 'prostoi1').setOrigin(0.5).setScale(metrics.playerScale).setDepth(5).setMute(true).setAlpha(0).setSize(1080, 1080).updateDisplayOrigin();
  const nv = v.video || (v.videoTexture && v.videoTexture.source) as HTMLVideoElement | null;
  if (nv) { 
    nv.style.objectFit = 'fill'; 
    nv.style.transform = 'translateZ(0)'; 
  }
  v.play(true);
  scene.tweens.add({ targets: v, alpha: 1, duration: 300 });
  return v;
};

export const spawnCatchFruitUI = (scene: any, metrics: CatchUiMetrics): void => {
  if (scene.isGameOver) return;
  const pad = metrics.fruitSize + 20;
  const f = scene.add.image(Phaser.Math.Between(pad, scene.scale.width - pad), -metrics.fruitSize, `fruit-${FRUITS[Math.floor(Math.random() * FRUITS.length)]}`);
  scene.fruitsGroup.push(f.setDisplaySize(metrics.fruitSize, metrics.fruitSize).setDepth(4));
};

export const drawHeartsUI = (scene: any): void => {
  scene.heartsGroup.forEach((h: any) => h.destroy());
  scene.heartsGroup = [];
  const isPort = scene.scale.width < scene.scale.height;
  const startX = isPort ? 24 : 70;
  const startY = isPort ? 110 : 130;
  const spacing = isPort ? 32 : 40;
  const size = isPort ? 28 : 36;
  for (let i = 0; i < Math.ceil(scene.hp / 25); i++) {
    scene.heartsGroup.push(scene.add.image(startX + i * spacing, startY, 'icon-life').setDisplaySize(size, size).setOrigin(0, 0.5).setDepth(20));
  }
};

export const endCatchGame = (scene: any, isWin: boolean, onBack: () => void, onRestart: () => void): void => {
  scene.isGameOver = true;
  if (scene.spawnTimer) scene.spawnTimer.remove(); 
  if (scene.healHeartTimer) scene.healHeartTimer.remove();
  scene.fruitsGroup.forEach((f: any) => f.destroy());
  scene.fruitsGroup = [];
  destroyCatchUI();
  if (isWin) animateCoinExplosion(scene, 20);
  showCatchGameOver(scene, scene.score, isWin, onBack, onRestart);
};
