import { Scene, Math as PMath } from 'phaser';
import { useCatchGameStore } from './useCatchGameStore';
import { CatchGamePhysicsManager } from './CatchGamePhysicsManager';
import { CatchGameUiManager } from './CatchGameUiManager';
import { CatchGamePet } from './components/CatchGamePet';

import fonGorizImg from '/src/assets/background/fon_goriz.png';
import fonVertImg from '/src/assets/background/fon_vert.png';
import petVideoUrl from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';

const FRUITS = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];

export class CatchGameScene extends Scene {
  public difficulty = 'medium'; public score = 0; public hp = 100; public petVideoSrc = petVideoUrl;
  public physicsManager!: CatchGamePhysicsManager; public uiManager!: CatchGameUiManager; public petEntity!: CatchGamePet;
  private bgImage: Phaser.GameObjects.Image | null = null; private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private unsubscribeStore: (() => void) | null = null; private resizeTimeout: any = null;

  constructor() { super('CatchGameScene'); }

  public init(data: { difficulty?: 'easy' | 'medium' | 'hard' }): void {
    this.difficulty = data.difficulty || 'medium'; this.score = 0; this.hp = 100;
    const cfg = { easy: { s: 5, d: 1400 }, medium: { s: 7, d: 1000 }, hard: { s: 10, d: 700 } }[this.difficulty] || { s: 7, d: 1000 };
    this.uiManager = new CatchGameUiManager(this); this.physicsManager = new CatchGamePhysicsManager(this, cfg.s, cfg.d); this.petEntity = new CatchGamePet(this);
    useCatchGameStore.getState().initGame();
  }

  public preload(): void {
    this.load.image('catch_bg_horiz', fonGorizImg).image('catch_bg_vert', fonVertImg);
    FRUITS.forEach(id => this.load.image(`fruit_${id}`, localGetFruitUrl(id)));
  }

  public create(): void {
    document.getElementById('game-container')?.setAttribute('data-scene', this.scene.key);
    this.bgImage = this.add.image(0, 0, 'catch_bg_horiz').setOrigin(0, 0); this.executeBackgroundResize();
    this.uiManager.createUiContainer(); this.petEntity.create(); this.physicsManager.initPhysics();
    if (this.input.keyboard) this.cursors = this.input.keyboard.createCursorKeys();
    this.uiManager.render();

    this.unsubscribeStore = useCatchGameStore.subscribe(s => s.isGameOver, (isOver) => {
      if (isOver) { this.physicsManager.pausePhysics(); this.petEntity.pause(); this.petEntity.hide(); this.uiManager.render(); if (useCatchGameStore.getState().isWin) this.triggerWinCoinsExplosion(); }
    });

    window.addEventListener('resize', this.handleResize); window.addEventListener('orientationchange', this.handleResize);
    this.events.once('shutdown', () => this.cleanup());
  }

  public update(time: number): void {
    if (useCatchGameStore.getState().isGameOver) return;
    const p = this.input.activePointer; const m = this.uiManager.metrics; const half = this.petEntity.width / 2; const maxB = m.screenWidth - half;
    if (p.isDown || p.deltaX !== 0 || p.deltaY !== 0) this.petEntity.updatePosition(Math.max(half, Math.min(maxB, p.x)));
    if (this.cursors?.left.isDown) { this.petEntity.updatePosition(Math.max(half, Math.min(maxB, this.petEntity.x - 18))); }
    else if (this.cursors?.right.isDown) { this.petEntity.updatePosition(Math.max(half, Math.min(maxB, this.petEntity.x + 18))); }
    this.physicsManager.updatePhysics(time, this.petEntity);
  }

  public addScore(): void {
    this.score += 1; const isWin = this.score >= 20; const isOver = this.hp <= 0 || isWin;
    useCatchGameStore.getState().updateGameState(this.score, this.hp, isOver, isWin); this.uiManager.render();
  }

  public loseHp(): void {
    this.hp = Math.max(0, this.hp - 20); const isOver = this.hp <= 0 || this.score >= 20;
    useCatchGameStore.getState().updateGameState(this.score, this.hp, isOver, useCatchGameStore.getState().isWin); this.uiManager.render();
  }

  private handleResize = (): void => { clearTimeout(this.resizeTimeout); this.resizeTimeout = setTimeout(() => this.executeBackgroundResize(), 150); };

  private executeBackgroundResize(): void {
    if (!this.bgImage || !this.uiManager) return;
    const rx = this.petEntity ? (this.petEntity.x / this.uiManager.metrics.screenWidth) : 0.5;
    this.uiManager.updateMetrics(); const m = this.uiManager.metrics;
    this.scale.resize(m.screenWidth, m.screenHeight); this.bgImage.setTexture(m.isPortrait ? 'catch_bg_vert' : 'catch_bg_horiz').setDisplaySize(m.screenWidth, m.screenHeight);
    this.petEntity?.resize(isNaN(rx) ? 0.5 : rx); this.physicsManager?.resizeMetrics(); this.uiManager.render();
  }

  public restartGame(): void { this.scene.restart({ difficulty: this.difficulty }); }
  public exitGame(): void { this.scene.start('MainScene'); }

  private cleanup(): void {
    clearTimeout(this.resizeTimeout); window.removeEventListener('resize', this.handleResize); window.removeEventListener('orientationchange', this.handleResize);
    this.unsubscribeStore?.(); this.physicsManager?.destroy(); this.petEntity?.destroy(); this.uiManager?.destroy(); useCatchGameStore.getState().resetStore();
  }

  public triggerWinCoinsExplosion(): void {
    const m = this.uiManager.metrics;
    for (let i = 0; i < 20; i++) {
      this.time.delayedCall(i * 30, () => {
        if (!this.scene.isActive(this.scene.key)) return;
        const c = this.add.graphics().fillStyle(0xf9b300, 1).fillCircle(m.screenWidth / 2, m.screenHeight / 2, 14).setDepth(30);
        this.tweens.chain({ targets: c, tweens: [{ x: PMath.Between(-150, 150), y: -PMath.Between(100, 300), scale: 1.2, duration: 520, ease: 'Quad.easeOut' }, { y: m.screenHeight + 40 - c.y, alpha: 0, scale: 0.5, duration: 480, ease: 'Quad.easeIn', onComplete: () => c.destroy() }] });
      });
    }
  }
}

export const localGetFruitUrl = (id: string): string => {
  const fImgs = import.meta.glob('/src/assets/fruits/fruits_*.png', { eager: true, query: '?url' }) as Record<string, { default: string }>;
  return fImgs[`/src/assets/fruits/fruits_${id}.png`]?.default || '';
};
