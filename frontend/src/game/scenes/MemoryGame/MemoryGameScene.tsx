import * as Phaser from 'phaser';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { generateDeckLogic } from './MemoryGameLogic';
import { IMemoryGameScene, MemoryUiContainer } from './components/MemoryUiContainer';

import { useMemoryGameStore } from './useMemoryGameStore';
import { buildGridUIEngine } from './utils/memoryStepEngine';

export interface MemoryConfig { rows: number; cols: number; pairs: number; shuffleCount: number; }
export interface MemoryCardContainer extends Phaser.GameObjects.Container { fruitKey: string; fruitImg: Phaser.GameObjects.Image; shirtImg: Phaser.GameObjects.Image; isFaceUp: boolean; }

const FRUITS: string[] = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];
const fImgs = import.meta.glob('/src/assets/fruits/fruits_*.png', { eager: true, query: '?url' }) as Record<string, { default: string }>;

export class MemoryGameScene extends Phaser.Scene implements IMemoryGameScene {
  public difficulty: string = 'easy';
  public selectedCards: MemoryCardContainer[] = [];
  public canClick: boolean = false;
  public matchesFound: number = 0;
  public cardsList: MemoryCardContainer[] = [];
  public totalPairs: number = 0;
  public stepsTaken: number = 0;
  
  public mTimer: Phaser.Time.TimerEvent | null = null;
  public pTimer: Phaser.Time.TimerEvent | null = null;
  private isDestroyed: boolean = false;
  private regUiRoot: Root | null = null;

  public cfgs: Record<string, MemoryConfig> = {
    easy: { rows: 3, cols: 4, pairs: 6, shuffleCount: 12 },
    medium: { rows: 4, cols: 6, pairs: 12, shuffleCount: 24 },
    hard: { rows: 4, cols: 8, pairs: 16, shuffleCount: 32 },
  };

  constructor() { super('MemoryGameScene'); }

  public init = (data: { difficulty?: string }): void => {
    this.difficulty = data.difficulty || 'easy';
    this.selectedCards = []; this.canClick = false; this.matchesFound = 0; this.cardsList = []; this.stepsTaken = 0; this.isDestroyed = false;
    useMemoryGameStore.getState().resetStore();
  };

  public preload = (): void => {
    this.load.image('card-back', new URL('/src/assets/buttom_menu-icons/sleep.svg?url', import.meta.url).href);
    for (let i = 0; i < FRUITS.length; i++) {
      const id = FRUITS[i]; const p = `/src/assets/fruits/fruits_${id}.png`;
      if (fImgs[p]?.default) this.load.image(`fruit-${id}`, fImgs[p].default);
    }
  };

  public create = (): void => {
    document.getElementById('game-container')?.setAttribute('data-scene', this.scene.key);
    this.setupUI();
    this.totalPairs = (this.cfgs[this.difficulty] || this.cfgs.easy).pairs;
    
    // Передаем инициализацию поля внешнему движку шагов
    buildGridUIEngine(this, generateDeckLogic(this.totalPairs, FRUITS));
    
    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', (): void => {
      this.scale.off('resize', this.handleResize, this);
      if (this.mTimer) this.mTimer.remove();
      if (this.pTimer) this.pTimer.remove();
      this.destroyUI();
    }, this);
  };

  private setupUI(): void {
    if (this.sys.game.canvas) this.sys.game.canvas.style.cssText = 'position: relative; z-index: 10;';
    let el = document.getElementById('memory-ui-overlay');
    if (!el) {
      el = document.createElement('div'); el.id = 'memory-ui-overlay'; el.className = 'absolute inset-0 z-40 pointer-events-none';
      document.getElementById('game-container')?.appendChild(el);
    }
    if (!this.regUiRoot && el) this.regUiRoot = createRoot(el);
    this.regUiRoot?.render(React.createElement(MemoryUiContainer, { onBack: () => this.exitGame() }));
  }

  private destroyUI(): void {
    if (this.regUiRoot) { try { this.regUiRoot.unmount(); } catch {} this.regUiRoot = null; }
    document.getElementById('memory-ui-overlay')?.remove();
  }

  private handleResize = (): void => {
    if (!this.scene.isActive(this.scene.key) || this.isDestroyed) return;
    if (this.mTimer) this.mTimer.remove();
    if (this.pTimer) this.pTimer.remove();
    this.tweens.killAll();
    
    const active = this.cardsList.map((c: MemoryCardContainer) => c.fruitKey);
    this.cardsList.forEach((c: MemoryCardContainer) => c?.destroy && c.destroy());
    
    this.cardsList = []; this.selectedCards = [];
    buildGridUIEngine(this, active);
    useMemoryGameStore.getState().setScore(this.matchesFound);
  };

  private exitGame = (): void => {
    this.isDestroyed = true;
    if (this.mTimer) this.mTimer.remove();
    if (this.pTimer) this.pTimer.remove();
    this.destroyUI();
    this.scene.start('MainScene');
  };
}
