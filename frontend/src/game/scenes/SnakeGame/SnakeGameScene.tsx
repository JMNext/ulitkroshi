import { Scene, Math as PMath } from 'phaser';
import { useSnakeGameStore } from './useSnakeGameStore';
import { SnakeGameLogicManager } from './SnakeGameLogicManager';
import { SnakeGameUiManager } from './SnakeGameUiManager';

import fonGorizImg from '/src/assets/background/fon_goriz.png';
import fonVertImg from '/src/assets/background/fon_vert.png';

const FP = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];

export class SnakeGameScene extends Scene {
  public difficulty = 'medium'; score = 0; hp = 100;
  public logicManager!: SnakeGameLogicManager; public uiManager!: SnakeGameUiManager;
  private bgImage: Phaser.GameObjects.Image | null = null; private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null; private unsubscribeStore: (() => void) | null = null; private resizeTimeout: any = null; private uncrashTime = 0;

  constructor() { super('SnakeGameScene'); }

  public init(data: { difficulty?: 'easy' | 'medium' | 'hard' }): void {
    this.difficulty = data.difficulty || 'medium'; this.score = 0; this.hp = 100;
    const speed = { easy: 340, medium: 200, hard: 120 }[this.difficulty] || 200;
    this.uiManager = new SnakeGameUiManager(this); this.logicManager = new SnakeGameLogicManager(this, speed);
    useSnakeGameStore.getState().initGame();
  }

  public preload(): void {
    this.load.image('snake_bg_horiz', fonGorizImg).image('snake_bg_vert', fonVertImg);
    FP.forEach((id, idx) => this.load.image(`fruit_idx_${idx}`, localGetFruitUrl(id)));
  }

  public create(): void {
    document.getElementById('game-container')?.setAttribute('data-scene', this.scene.key);
    this.bgImage = this.add.image(0, 0, 'snake_bg_horiz').setOrigin(0, 0); this.executeBackgroundResize();
    this.uiManager.createUiContainer(); this.logicManager.initGame();

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const lm = this.logicManager, h = lm.snake[0];
      if (useSnakeGameStore.getState().isGameOver || !h || p.x < lm.startX || p.x > lm.startX + lm.totalGridW || p.y < lm.startY || p.y > lm.startY + lm.totalGridH) return;
      const dX = p.x - (lm.startX + h.x * lm.cellSize + lm.cellSize / 2), dY = p.y - (lm.startY + h.y * lm.cellSize + lm.cellSize / 2);
      lm.changeDirection(Math.abs(dX) > Math.abs(dY) ? (dX > 0 ? 'RIGHT' : 'LEFT') : (dY > 0 ? 'DOWN' : 'UP'));
    });

    this.uiManager.render();
    this.unsubscribeStore = useSnakeGameStore.subscribe(s => s.isGameOver, (isOver) => {
      if (isOver) { this.uiManager.render(); if (this.score >= 20) this.triggerWinCoinsExplosion(); }
    });
    if (this.input.keyboard) this.cursors = this.input.keyboard.createCursorKeys();
    
    window.addEventListener('resize', this.handleResize); window.addEventListener('orientationchange', this.handleResize);
    this.events.once('shutdown', () => this.cleanup());
  }

  public update(time: number): void {
    const store = useSnakeGameStore.getState(); if (store.isGameOver) return;
    if (store.isCrashed) {
      if (time > this.uncrashTime) {
        useSnakeGameStore.getState().updateGameState(this.score, this.hp, false, false, false, false);
        this.logicManager.resetPositionOnCrash(); this.uiManager.render();
      }
      return;
    }
    const c = this.cursors, lm = this.logicManager;
    if (c) {
      if (c.left.isDown && lm.dir !== 'RIGHT') lm.changeDirection('LEFT');
      else if (c.right.isDown && lm.dir !== 'LEFT') lm.changeDirection('RIGHT');
      else if (c.up.isDown && lm.dir !== 'DOWN') lm.changeDirection('UP');
      else if (c.down.isDown && lm.dir !== 'UP') lm.changeDirection('DOWN');
    }
    lm.handleTicks(time);
  }

  public addScore(): void {
    this.score++; const isWin = this.score >= 20;
    useSnakeGameStore.getState().updateGameState(this.score, this.hp, isWin, isWin, true, false); this.uiManager.render();
  }

  public triggerCrash(time: number): void {
    this.hp = Math.max(0, this.hp - 25); const isOver = this.hp <= 0;
    useSnakeGameStore.getState().updateGameState(this.score, this.hp, isOver, false, false, !isOver);
    this.uiManager.render(); this.uncrashTime = time + 1500;
  }

  private handleResize = (): void => { clearTimeout(this.resizeTimeout); this.resizeTimeout = setTimeout(() => this.executeBackgroundResize(), 150); };

  private executeBackgroundResize(): void {
    if (!this.bgImage) return;
    const [w, h] = [window.innerWidth, window.innerHeight];
    this.scale.resize(w, h); this.bgImage.setTexture(h > w ? 'snake_bg_vert' : 'snake_bg_horiz').setDisplaySize(w, h);
    this.uiManager?.updateMetrics(); this.uiManager?.render(); this.logicManager?.resizeMetrics();
  }

  public exitGame(): void { this.scene.start('MainScene'); }

  private cleanup(): void {
    clearTimeout(this.resizeTimeout);
    window.removeEventListener('resize', this.handleResize); window.removeEventListener('orientationchange', this.handleResize);
    this.unsubscribeStore?.(); this.logicManager.destroy(); this.uiManager.destroy(); useSnakeGameStore.getState().resetStore();
  }

  public triggerWinCoinsExplosion(): void {
    const { width: w, height: h } = this.scale;
    for (let i = 0; i < 20; i++) {
      this.time.delayedCall(i * 30, () => {
        if (!this.scene.isActive(this.scene.key)) return;
        const c = this.add.graphics().fillStyle(0xf9b300, 1).fillCircle(w / 2, h / 2, 14).setDepth(30);
        this.tweens.chain({
          targets: c,
          tweens: [
            { x: PMath.Between(-150, 150), y: -PMath.Between(100, 300), scale: 1.2, duration: 520, ease: 'Quad.easeOut' },
            { y: h + 40 - c.y, alpha: 0, scale: 0.5, duration: 480, ease: 'Quad.easeIn', onComplete: () => c.destroy() }
          ]
        });
      });
    }
  }
}

export const localGetFruitUrl = (id: string): string => {
  const fImgs = import.meta.glob('/src/assets/fruits/fruits_*.png', { eager: true, query: '?url' }) as Record<string, { default: string }>;
  return fImgs[`/src/assets/fruits/fruits_${id}.png`]?.default || '';
};
