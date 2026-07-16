import * as Phaser from 'phaser';

export const FRUITS = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];

export interface CatchUiMetrics { 
  playerScale: number; 
  playerY: number; 
  fruitSize: number; 
  catchRadius: number; 
}

export interface ICatchGameScene extends Phaser.Scene {
  difficulty: string;
  score: number;
  hp: number;
  isGameOver: boolean;
  moveDirection: number;
  fruitSpeed: number;
  player: Phaser.GameObjects.Video;
  fruitsGroup: Phaser.GameObjects.Image[];
  visualHearts?: Phaser.GameObjects.Image[];
}

export const calculateCatchMetricsUI = (scene: Phaser.Scene): CatchUiMetrics => {
  const { width: w, height: h } = scene.scale;
  const isPort = w < h;
  const isTab = !isPort && (w / h) < 1.72;
  const isFold = isPort && (w / h) < 0.5;       
  
  return {
    playerScale: isFold ? (w * 0.42) / 1080 : (isPort ? (w * 0.32) / 1080 : (isTab ? (w * 0.22) / 1080 : (w * 0.16) / 1080)),
    playerY: isFold ? h - 240 : (isPort ? h - 265 : (isTab ? h - 220 : h - 250)),
    fruitSize: isFold ? Math.max(38, w * 0.12) : (isPort ? Math.max(45, Math.min(60, w * 0.12)) : Math.max(55, Math.min(75, h * 0.1))),
    catchRadius: isFold ? w * 0.16 : (isPort ? Math.max(50, Math.min(65, w * 0.14)) : Math.max(70, Math.min(90, h * 0.14)))
  };
};

export const createPlayerUI = (scene: Phaser.Scene, metrics: CatchUiMetrics): Phaser.GameObjects.Video => {
  const v = scene.add.video(scene.scale.width / 2, metrics.playerY, 'prostoi1')
    .setOrigin(0.5, 0.5)
    .setScale(metrics.playerScale)
    .setDepth(5)
    .setMute(true)
    .setAlpha(0);
  
  const sources = v.videoTexture?.source as any;
  const textureSource = Array.isArray(sources) ? sources : sources;
  const nv = v.video || textureSource?.image as HTMLVideoElement | null;
  
  if (nv && typeof nv.style !== 'undefined') {
    nv.classList.add('phaser-video-element');
  }
  
  v.play(true); 
  scene.tweens.add({ targets: v, alpha: 1, duration: 300 });
  return v;
};

export const drawHeartsUI = (scene: ICatchGameScene): void => {
  scene.visualHearts?.forEach(h => h.destroy()); 
  scene.visualHearts = [];
  
  const { width: w, height: h } = scene.scale;
  
  let startX = 70;
  let startY = 130;
  let spacing = 40;
  let size = 36;

  if (w < h) {
    startX = 24;
    startY = 110;
    spacing = 32;
    size = 28;
  }
  
  const heartsCount = Math.ceil(scene.hp / 25);
  for (let i = 0; i < heartsCount; i++) {
    const heart = scene.add.image(startX + i * spacing, startY, 'icon-life')
      .setDisplaySize(size, size)
      .setOrigin(0, 0.5)
      .setDepth(20);
    scene.visualHearts.push(heart);
  }
};
