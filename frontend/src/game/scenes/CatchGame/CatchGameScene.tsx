import * as Phaser from 'phaser';
import { Scene } from 'phaser';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import { BackgroundManager } from '../../../BackgroundManager';
import { getMovedPlayerX } from './CatchGameLogic';
import { CatchUiContainer } from './components/CatchUiContainer';
import { spawnItem, updateItemsPhysics } from './utils/CatchPhysicsEngine';
import { animateCoinExplosion, createBaseGameOverModal } from '../../../ui/components/GameOverModalUI';
import { CatchUiMetrics, FRUITS, calculateCatchMetricsUI, createPlayerUI, drawHeartsUI, ICatchGameScene } from './utils/CatchPhaserRender';

interface GameInitData {
  difficulty?: 'easy' | 'medium' | 'hard';
}

const DIFFICULTY_CONFIGS: Record<string, { s: number; d: number }> = {
  easy: { s: 5, d: 1600 },
  medium: { s: 8, d: 1200 },
  hard: { s: 11, d: 800 }
};

export class CatchGameScene extends Scene implements ICatchGameScene {
  public difficulty = 'medium';
  public score = 0;
  public hp = 100;
  public isGameOver = false;
  public moveDirection = 0;
  public fruitSpeed = 8;
  public player!: Phaser.GameObjects.Video;
  public fruitsGroup: Phaser.GameObjects.Image[] = [];
  public visualHearts?: Phaser.GameObjects.Image[] = [];

  private playerSpeed = 14;
  private spawnDelay = 1200;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private healTimer!: Phaser.Time.TimerEvent;
  private uiMetrics!: CatchUiMetrics;
  private regUiRoot: Root | null = null;
  private isDestroyed = false;
  private updateUI?: (score: number, hp: number) => void;
  private onPointerMoveRef!: (p: Phaser.Input.Pointer) => void;

  constructor() { 
    super('CatchGameScene'); 
  }

  public init = (data: GameInitData): void => {
    this.difficulty = data.difficulty || 'medium';
    this.score = 0;
    this.hp = 100;
    this.isGameOver = false;
    this.fruitsGroup = [];
    this.moveDirection = 0;
    this.isDestroyed = false;

    const cfgs = DIFFICULTY_CONFIGS[this.difficulty] || DIFFICULTY_CONFIGS.medium;
    this.fruitSpeed = cfgs.s;
    this.spawnDelay = cfgs.d;
  };

  public preload = (): void => {
    this.load.image('icon-life', '/src/assets/interface-icons/life.svg');
    this.load.video('prostoi1', '/src/assets/resources/1stpet-animation/prostoi-converted.webm');
    FRUITS.forEach(id => this.load.image(`f-${id}`, `/src/assets/fruits/fruits_${id}.png`));
  };

  public create = (): void => {
    const w = this.scale.width;
    this.uiMetrics = calculateCatchMetricsUI(this);
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    this.setupUI();

    this.player = createPlayerUI(this, this.uiMetrics).setPosition(w / 2, this.uiMetrics.playerY);
    this.playerSpeed = w < this.scale.height ? Math.max(9, Math.floor(w * 0.028)) : 18;
    drawHeartsUI(this);

    this.onPointerMoveRef = (p: Phaser.Input.Pointer) => {
      if (!this.isGameOver && this.player) {
        const hw = (this.player.displayWidth || 100) / 2;
        this.player.x = Phaser.Math.Clamp(p.x, hw, this.scale.width - hw);
      }
    };
    this.input.on('pointermove', this.onPointerMoveRef).on('pointerdown', this.onPointerMoveRef);

    const kd = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) this.moveDirection = -1;
      if (['ArrowRight', 'd', 'D'].includes(e.key)) this.moveDirection = 1;
    };
    const ku = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'a', 'A', 'ArrowRight', 'd', 'D'].includes(e.key)) this.moveDirection = 0;
    };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);

    this.spawnTimer = this.time.addEvent({ 
      delay: this.spawnDelay, 
      loop: true, 
      callback: () => spawnItem(this, `f-${Phaser.Utils.Array.GetRandom(FRUITS)}`, this.uiMetrics.fruitSize) 
    });
    
    this.healTimer = this.time.addEvent({ 
      delay: 30000, 
      loop: true, 
      callback: () => spawnItem(this, 'icon-life', this.uiMetrics.fruitSize, true) 
    });

    this.scale.on('resize', this.handleResize, this);
    
    this.events.once('shutdown', () => { 
      this.scale.off('resize', this.handleResize, this); 
      this.input.off('pointermove', this.onPointerMoveRef).off('pointerdown', this.onPointerMoveRef);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      this.destroyUI(); 
    }, this);
  };

  public update = (): void => {
    if (this.isGameOver) return;
    if (this.moveDirection !== 0) {
      const hw = (this.player.displayWidth || 100) / 2;
      this.player.x = getMovedPlayerX(this.player.x, this.moveDirection, this.playerSpeed, hw, this.scale.width - hw);
    }
    updateItemsPhysics(this, this.scale.width, this.scale.height, this.uiMetrics, () => this.endGame(true), () => this.endGame(false));
    this.updateUI?.(this.score, this.hp);
  };

  private setupUI(): void {
    let el = document.getElementById('catch-ui-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'catch-ui-overlay';
      el.className = 'absolute inset-0 pointer-events-none z-30';
      document.getElementById('game-container')?.appendChild(el);
    }
    this.regUiRoot = createRoot(el);
    this.regUiRoot.render(
      <CatchUiContainer 
        scene={this} 
        onBack={() => { this.destroyUI(); this.scene.start('MainScene'); }} 
        bind={(fn: (score: number, hp: number) => void) => { this.updateUI = fn; fn(this.score, this.hp); }} 
      />
    );
  }

  private destroyUI(): void { 
    this.regUiRoot?.unmount(); 
    this.regUiRoot = null; 
    document.getElementById('catch-ui-overlay')?.remove(); 
  }

  private handleResize = (): void => { 
    if (!this.scene.isActive(this.scene.key) || this.isDestroyed) return; 
    BackgroundManager.getInstance().applyBackground(this.scene.key); 
    this.uiMetrics = calculateCatchMetricsUI(this); 
    this.destroyUI(); 
    this.setupUI(); 
    drawHeartsUI(this); 
    if (this.player) this.player.setPosition(this.scale.width / 2, this.uiMetrics.playerY); 
    this.fruitsGroup.forEach(f => f?.active && f.setDisplaySize(this.uiMetrics.fruitSize, this.uiMetrics.fruitSize)); 
  };

  private endGame(isWin = false): void {
    if (this.isDestroyed) return; 
    this.isGameOver = true; 
    this.spawnTimer?.remove(); 
    this.healTimer?.remove(); 
    this.destroyUI(); 
    if (isWin) animateCoinExplosion(this, 20);
    
    this.time.delayedCall(isWin ? 1200 : 0, () => createBaseGameOverModal(this, { 
      title: isWin ? 'ПОБЕДА!' : 'ИГРА ОКОНЧЕНА', 
      resultLabel: 'СЧЕТ', 
      score: this.score, 
      buttonText: 'В МЕНЮ', 
      isWin, 
      onBack: () => { this.isDestroyed = true; this.scene.start('MainScene'); }, 
      onRestart: () => { this.isDestroyed = true; this.scene.restart(); } 
    }));
  }
}
