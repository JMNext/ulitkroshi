import { Scene } from 'phaser';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { SnakeState } from './SnakeGameLogic';
import { ISnakeGameScene, SnakeUiContainer } from './components/SnakeUiContainer';
import { calculateSnakeMetrics } from './utils/SnakeMetrics';
import { buildGridRender } from './utils/buildGridRender';
import { executeSnakeStep } from './utils/snakeStepEngine';
import iconLifeSvg from '/src/assets/interface-icons/life.svg?url';
import { useSnakeGameStore } from './useSnakeGameStore';

interface GameInitData { difficulty?: 'easy' | 'medium' | 'hard'; }

export class SnakeGameScene extends Scene implements ISnakeGameScene {
  public sState!: SnakeState;
  public visualSnake: any[] = [];
  public visualHearts: any[] = [];
  public fruitObj: any = null;
  public m = { gridSize: 0, offsetX: 0, offsetY: 0 };
  public gridGfx: any = null;
  public interval = 160;
  public petWashState = false;
  public petCrashState = false;
  
  private moveTimer = 0;
  private regUiRoot: Root | null = null;
  private isDestroyed = false;

  public get score(): number { return this.sState?.score || 0; }

  constructor() { super('SnakeGameScene'); }

  public init = (data: GameInitData): void => {
    const SPEED_CONFIG: Record<string, number> = { easy: 380, medium: 160, hard: 100 };
    this.interval = SPEED_CONFIG[data.difficulty || 'medium'] || 160;
    this.visualSnake = []; this.fruitObj = null; this.moveTimer = 0; this.isDestroyed = false;
    this.petWashState = false; this.petCrashState = false;
    this.sState = {
      snake: [{ x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }],
      dir: 'RIGHT', nextDir: 'RIGHT', score: 0, hp: 100, isOver: false, isPause: false
    };
    useSnakeGameStore.getState().resetStore();
  };

  public preload = (): void => {
    this.load.image('icon-life', iconLifeSvg);
    const FRUITS = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];
    FRUITS.forEach(id => {
      const fImgs = import.meta.glob('/src/assets/fruits/fruits_*.png', { eager: true, query: '?url' }) as Record<string, { default: string }>;
      fImgs[`/src/assets/fruits/fruits_${id}.png`]?.default && this.load.image(`f-${id}`, fImgs[`/src/assets/fruits/fruits_${id}.png`].default);
    });
  };

  public create = (): void => {
    document.getElementById('game-container')?.setAttribute('data-scene', this.scene.key);
    this.setupUI();
    this.m = calculateSnakeMetrics(this.scale.gameSize.width, this.scale.gameSize.height);
    buildGridRender(this);

    window.addEventListener('keydown', this.handleKeyDown);
    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
      window.removeEventListener('keydown', this.handleKeyDown);
      this.destroyUI();
    }, this);
  };

  // ИСПРАВЛЕНО: Объявляем метод через стрелочную функцию, чтобы его тип существовал для create()
  private handleKeyDown = (e: KeyboardEvent): void => { 
    const DIR_MAP: Record<string, string> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT' };
    if (e && DIR_MAP[e.key]) this.changeDirection(DIR_MAP[e.key]); 
  };

  public update = (time: number): void => {
    if (!this.sState.isPause && !this.sState.isOver && this.m.gridSize > 0 && time >= this.moveTimer) {
      executeSnakeStep(this); 
      this.moveTimer = time + this.interval;
    }
  };

  public changeDirection = (d: string): void => {
    const OPPOSITE_DIR: Record<string, string> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (OPPOSITE_DIR[d] !== this.sState.dir) {
      this.sState.nextDir = d;
      if (this.sState.isPause) {
        this.sState.isPause = false; this.sState.dir = d;
        this.moveTimer = this.time.now + this.interval;
      }
    }
  };

  private setupUI() {
    let el = document.getElementById('snake-ui-overlay');
    if (!el) {
      el = document.createElement('div'); el.id = 'snake-ui-overlay';
      el.className = 'absolute inset-0 z-40 pointer-events-none';
      document.getElementById('game-container')?.appendChild(el);
    }
    if (!this.regUiRoot && el) this.regUiRoot = createRoot(el);
    this.regUiRoot?.render(React.createElement(SnakeUiContainer, {
      scene: this as any,
      onBack: () => { this.destroyUI(); this.scene.start('MainScene'); },
      onRestart: () => this.scene.restart()
    }));
  }

  private handleResize = () => {
    if (!this.scene.isActive(this.scene.key) || this.isDestroyed) return;
    this.m = calculateSnakeMetrics(this.scale.gameSize.width, this.scale.gameSize.height);
    buildGridRender(this);
    useSnakeGameStore.getState().setGameState(this.sState.score, this.sState.hp, this.sState.isOver, this.petWashState, this.petCrashState);
  };

  private destroyUI() { 
    this.isDestroyed = true;
    if (this.regUiRoot) { try { this.regUiRoot.unmount(); } catch {} this.regUiRoot = null; }
    document.getElementById('snake-ui-overlay')?.remove(); 
  }

  public animateCoins(amount: number): void {
    const w = this.scale.width, h = this.scale.height;
    for (let i = 0; i < amount; i++) {
      this.time.delayedCall(i * 30, () => {
        const rad = Math.max(12, Math.min(18, h * 0.024));
        const c = this.add.graphics().fillStyle(0xf9b300, 1).fillCircle(0, 0, rad).setDepth(30);
        c.x = w / 2; c.y = h / 2;
        this.tweens.add({
          targets: c, x: c.x + Phaser.Math.Between(-150, 150), y: c.y - Phaser.Math.Between(100, 300), scale: 1.2, duration: 520, ease: 'Quad.easeOut',
          onComplete: () => this.tweens.add({ targets: c, y: h + 40, alpha: 0, scale: 0.5, duration: 480, ease: 'Quad.easeIn', onComplete: () => c.destroy() })
        });
      });
    }
  }
}
