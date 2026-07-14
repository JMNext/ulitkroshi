import * as Phaser from 'phaser';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import { BackgroundManager } from '../../../BackgroundManager';
import { animateCoinExplosion, createBaseGameOverModal } from '../../../ui/components/GameOverModalUI';
import { processSnakeStepLogic, SnakeState } from './SnakeGameLogic';
import { SnakeUiContainer, ISnakeGameScene } from './components/SnakeUiContainer';
import { buildGridGfx, drawSegmentGfx } from './utils/SnakePhaserRenderer';

interface GameInitData {
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface IFruitImage extends Phaser.GameObjects.Image {
  gridX: number;
  gridY: number;
}

const FRUITS = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];
const DIR_MAP: Record<string, string> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT' };
const fImgs = import.meta.glob('/src/assets/fruits/fruits_*.png', { eager: true, query: '?url' }) as Record<string, { default: string }>;
const OPPOSITE_DIR: Record<string, string> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
const SPEED_CONFIG: Record<string, number> = { easy: 380, medium: 160, hard: 100 };

export class SnakeGameScene extends Phaser.Scene implements ISnakeGameScene {
  private sState!: SnakeState;
  private visualSnake: Phaser.GameObjects.Graphics[] = [];
  private visualHearts: Phaser.GameObjects.Image[] = [];
  private fruitObj: IFruitImage | null = null;
  private moveTimer = 0;
  private interval = 160;
  private regUiRoot: Root | null = null;
  private isDestroyed = false;
  private m = { gridSize: 0, offsetX: 0, offsetY: 0 };
  private gridGfx: Phaser.GameObjects.Graphics | null = null;
  private updateUI?: (score: number) => void;
  private trigAnim?: () => void;
  private trigSadAnim?: () => void;

  public get score(): number { return this.sState?.score || 0; }

  constructor() { super('SnakeGameScene'); }

  public init = (data: GameInitData): void => {
    this.interval = SPEED_CONFIG[data.difficulty || 'medium'] || 160;
    this.visualSnake = []; this.visualHearts = []; this.fruitObj = null; this.moveTimer = 0; this.isDestroyed = false;
    this.sState = { snake: [{ x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }], dir: 'RIGHT', nextDir: 'RIGHT', score: 0, hp: 100, isOver: false, isPause: false };
  };

  public preload = (): void => {
    this.load.image('icon-life', '/src/assets/interface-icons/life.svg');
    FRUITS.forEach(id => { const p = `/src/assets/fruits/fruits_${id}.png`; fImgs[p]?.default && this.load.image(`f-${id}`, fImgs[p].default); });
  };

  public create = (): void => {
    this.calcMetrics(); BackgroundManager.getInstance().applyBackground(this.scene.key); this.setupUI(); this.buildGrid();
    window.addEventListener('keydown', e => e && DIR_MAP[e.key] && this.changeDirection(DIR_MAP[e.key]));
    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => { this.scale.off('resize', this.handleResize, this); window.removeEventListener('keydown', e => e && DIR_MAP[e.key] && this.changeDirection(DIR_MAP[e.key])); this.destroyUI(); }, this);
  };

  public update = (time: number): void => { if (!this.sState.isPause && !this.sState.isOver && time >= this.moveTimer) { this.step(); this.moveTimer = time + this.interval; } };

  public changeDirection = (d: string): void => { 
    if (OPPOSITE_DIR[d] !== this.sState.dir) { 
      this.sState.nextDir = d; 
      if (this.sState.isPause) { this.sState.isPause = false; this.sState.dir = d; this.moveTimer = this.time.now + this.interval; } 
    } 
  };

  private calcMetrics() {
    const [w, h] = [window.innerWidth, window.innerHeight];
    const size = w < h ? Math.max(24, Math.min(36, Math.floor((w * ((w / h) < 0.5 ? 0.9 : 0.85)) / 12))) : Math.max(24, Math.min(48, Math.floor(w * 0.55 / 12), Math.floor(h * 0.65 / 12)));
    this.m = { gridSize: size, offsetX: Math.floor((w - 12 * size) / 2), offsetY: Math.floor((h - 12 * size) / 2) };
  }

  private setupUI() {
    let el = document.getElementById('snake-ui-overlay');
    if (!el) { el = document.createElement('div'); el.id = 'snake-ui-overlay'; el.className = 'absolute inset-0 pointer-events-none z-30'; document.getElementById('game-container')?.appendChild(el); }
    this.regUiRoot = createRoot(el);
    this.regUiRoot.render(<SnakeUiContainer scene={this} gridOffsetY={this.m.offsetY} onBack={() => { this.destroyUI(); this.scene.start('MainScene'); }} bind={(s: (v: number) => void, a: () => void, sa: () => void) => { this.updateUI = s; this.trigAnim = a; this.trigSadAnim = sa; }} />);
  }

  private buildGrid() {
    this.gridGfx = buildGridGfx(this, this.m.offsetX, this.m.offsetY, this.m.gridSize); this.drawHearts();
    this.sState.snake.forEach((pt, i) => this.visualSnake.push(drawSegmentGfx(this, this.m.offsetX, this.m.offsetY, this.m.gridSize, pt.x, pt.y, i === 0, this.sState.dir)));
    this.spawnFruit();
  }

  private drawHearts() {
    this.visualHearts.forEach(h => h?.destroy()); this.visualHearts = [];
    
    let startX = 70;
    let startY = 130;
    let spacing = 40;
    let size = 36;

    if (this.scale.width < this.scale.height) {
      startX = 24;
      startY = 110;
      spacing = 32;
      size = 28;
    }

    const heartsCount = Math.ceil(this.sState.hp / 25);
    for (let i = 0; i < heartsCount; i++) {
      this.visualHearts.push(this.add.image(startX + i * spacing, startY, 'icon-life').setDisplaySize(size, size).setOrigin(0, 0.5).setDepth(20));
    }
  }

  private spawnFruit() {
    this.fruitObj?.destroy(); let lx = 0, ly = 0;
    do { lx = Phaser.Math.Between(0, 11); ly = Phaser.Math.Between(0, 11); } while (this.sState.snake.some(s => s.x === lx && s.y === ly));
    const item = this.add.image(this.m.offsetX + lx * this.m.gridSize + this.m.gridSize / 2, this.m.offsetY + ly * this.m.gridSize + this.m.gridSize / 2, `f-${Phaser.Utils.Array.GetRandom(FRUITS)}`).setDisplaySize(this.m.gridSize - 6, this.m.gridSize - 6).setDepth(4) as IFruitImage;
    item.gridX = lx; item.gridY = ly; this.fruitObj = item;
  }

  private step() {
    const report = processSnakeStepLogic(this.sState, this.fruitObj?.gridX ?? -1, this.fruitObj?.gridY ?? -1);
    if (report.isHit) { this.drawHearts(); this.trigSadAnim?.(); if (this.sState.hp <= 0) return this.endGame(false); this.time.delayedCall(1500, () => { if (!this.sState.isOver && this.sState.isPause) { this.sState.isPause = false; this.moveTimer = this.time.now + this.interval; } }); return; }
    const prevHead = this.visualSnake[0]; if (prevHead) prevHead.clear().fillStyle(0x61aa05, 1).fillRoundedRect(0, 0, this.m.gridSize - 4, this.m.gridSize - 4, this.m.gridSize * 0.2);
    this.visualSnake.unshift(drawSegmentGfx(this, this.m.offsetX, this.m.offsetY, this.m.gridSize, report.head.x, report.head.y, true, this.sState.dir));
    if (report.didEat) { this.updateUI?.(this.sState.score); this.trigAnim?.(); if (this.sState.score >= 20) this.endGame(true); else this.spawnFruit(); } else this.visualSnake.pop()?.destroy();
  }

  private handleResize = () => { if (!this.scene.isActive(this.scene.key) || this.isDestroyed) return; BackgroundManager.getInstance().applyBackground(this.scene.key); this.gridGfx?.destroy(); this.fruitObj?.destroy(); this.fruitObj = null; this.visualSnake.forEach(s => s?.destroy()); this.visualSnake = []; this.calcMetrics(); this.destroyUI(); this.setupUI(); this.buildGrid(); };
  private destroyUI() { this.regUiRoot?.unmount(); this.regUiRoot = null; document.getElementById('snake-ui-overlay')?.remove(); }

  private endGame(isWin = false) {
    if (this.isDestroyed) return; this.sState.isOver = true; this.destroyUI(); if (isWin) animateCoinExplosion(this, 20);
    this.time.delayedCall(isWin ? 1200 : 0, () => createBaseGameOverModal(this, { title: isWin ? 'ПОБЕДА!' : 'ИГРА ОКОНЧЕНА', resultLabel: 'СЧЕТ', score: this.sState.score, buttonText: 'В МЕНЮ', isWin, onBack: () => { this.isDestroyed = true; this.scene.start('MainScene'); }, onRestart: () => { this.isDestroyed = true; this.scene.restart(); } }));
  }
}
