import { Scene, Time, Math as PhaserMath } from 'phaser';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { CatchUiContainer } from './components/CatchUiContainer';

import {
  DIFFICULTY_CONFIGS,
  getMovedPlayerX,
  removeKeyboardControls,
  removeMouseControls,
  setupKeyboardControls,
  setupMouseControls,
} from './CatchGameLogic';
import {
  calculateCatchMetricsUI,
  CatchUiMetrics,
  createPlayerUI,
  drawHeartsUI,
  FRUITS,
  ICatchGameScene,
} from './utils/CatchPhaserRender';
import { setupGameTimers, updateItemsPhysics } from './utils/CatchPhysicsEngine';

import iconLifeSvg from '/src/assets/interface-icons/life.svg?url';
import petVideoUrl from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';
import { useCatchGameStore } from './useCatchGameStore';

const fruitImgs = import.meta.glob('/src/assets/fruits/fruits_*.png', { eager: true, query: '?url' }) as Record<string, { default: string }>;

export class CatchGameScene extends Scene implements ICatchGameScene {
  public difficulty = 'medium';
  public score = 0;
  public hp = 100;
  public isGameOver = false;
  public moveDirection = 0;
  public fruitSpeed = 8;
  public player!: any;
  public fruitsGroup: any[] = [];
  public visualHearts?: any[] = [];

  private playerSpeed = 14;
  private spawnDelay = 1200;
  private spawnTimer!: Time.TimerEvent;
  private healTimer!: Time.TimerEvent;
  private uiMetrics!: CatchUiMetrics;
  private regUiRoot: Root | null = null;
  private isDestroyed = false;
  private onPointerMoveRef!: (p: any) => void;
  private kl!: { keydown: (e: KeyboardEvent) => void; keyup: (e: KeyboardEvent) => void };

  constructor() { super('CatchGameScene'); }

  public init = (data: { difficulty?: 'easy' | 'medium' | 'hard' }): void => {
    this.difficulty = data.difficulty || 'medium';
    this.score = 0; this.hp = 100; this.isGameOver = false; this.fruitsGroup = []; this.moveDirection = 0; this.isDestroyed = false;
    const cfgs = DIFFICULTY_CONFIGS[this.difficulty] || DIFFICULTY_CONFIGS.medium;
    this.fruitSpeed = cfgs.s; this.spawnDelay = cfgs.d;

    // Сбрасываем стейт Zustand под новые настройки игры
    useCatchGameStore.getState().resetStore();
  };

  public preload = (): void => {
    this.load.image('icon-life', iconLifeSvg);
    if (!this.cache.video.exists('prostoi1')) this.load.video('prostoi1', petVideoUrl);
    FRUITS.forEach(id => {
      const p = `/src/assets/fruits/fruits_${id}.png`;
      if (fruitImgs[p]?.default) this.load.image(`f-${id}`, fruitImgs[p].default);
    });
  };

  public create = (): void => {
    const w = this.scale.width;
    if (this.game?.sound) this.game.sound.pauseOnBlur = false;

    this.uiMetrics = calculateCatchMetricsUI(this);
    document.getElementById('game-container')?.setAttribute('data-scene', this.scene.key);

    this.player = createPlayerUI(this, this.uiMetrics).setPosition(w / 2, this.uiMetrics.playerY);
    this.playerSpeed = w < this.scale.height ? Math.max(9, Math.floor(w * 0.028)) : 18;
    drawHeartsUI(this);
    this.setupUI();

    this.onPointerMoveRef = setupMouseControls(this, this.player);
    this.kl = setupKeyboardControls(dir => this.moveDirection = dir);

    const timers = setupGameTimers(this, this.spawnDelay, this.uiMetrics.fruitSize);
    this.spawnTimer = timers.spawnTimer; this.healTimer = timers.healTimer;

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
      removeMouseControls(this, this.onPointerMoveRef); removeKeyboardControls(this.kl);
      this.destroyUI();
    }, this);
  };

  public update = (): void => {
    if (this.isGameOver) return;
    if (this.moveDirection !== 0) {
      const hw = (this.player.displayWidth || 100) / 2;
      this.player.x = getMovedPlayerX(this.player.x, this.moveDirection, this.playerSpeed, hw, this.scale.width - hw);
    }
    
    // Внутри физического движка меняются score и hp, мы синхронизируем Zustand только при мутациях
    const prevScore = this.score;
    const prevHp = this.hp;

    updateItemsPhysics(this, this.scale.width, this.scale.height, this.uiMetrics, () => this.endGame(true), () => this.endGame(false));
    
    if (prevScore !== this.score) useCatchGameStore.getState().setScore(this.score);
    if (prevHp !== this.hp) useCatchGameStore.getState().setHp(this.hp);
  };

  private setupUI(): void {
    let el = document.getElementById('catch-ui-overlay');
    if (!el) {
      el = document.createElement('div'); el.id = 'catch-ui-overlay'; el.className = 'absolute inset-0 z-40 pointer-events-none';
      document.getElementById('game-container')?.appendChild(el);
    }
    if (!this.regUiRoot && el) this.regUiRoot = createRoot(el);
    this.regUiRoot?.render(
      React.createElement(CatchUiContainer, {
        onBack: () => this.leaveScene('MainScene'),
        onRestart: () => this.leaveScene(this.scene.key, true),
      })
    );
  }

  private leaveScene(targetScene: string, isRestart = false): void {
    this.isDestroyed = true; 
    removeMouseControls(this, this.onPointerMoveRef); 
    removeKeyboardControls(this.kl); 
    this.destroyUI();
    
    if (isRestart) {
      this.scene.restart(); 
    } else {
      const mainScene = this.scene.get('MainScene') as any;
      if (mainScene) mainScene.currentPetState = 'prostoi1';
      this.scene.start(targetScene);
    }
  }

  private destroyUI(): void {
    if (this.regUiRoot) { try { this.regUiRoot.unmount(); } catch {} this.regUiRoot = null; }
    document.getElementById('catch-ui-overlay')?.remove();
  }

  private handleResize = (): void => {
    if (!this.scene.isActive(this.scene.key) || this.isDestroyed) return;
    this.uiMetrics = calculateCatchMetricsUI(this); this.destroyUI();
    if (this.player) this.player.setPosition(this.scale.width / 2, this.uiMetrics.playerY);
    drawHeartsUI(this); this.setupUI();
    this.fruitsGroup.forEach(f => f?.active && f.setDisplaySize(this.uiMetrics.fruitSize, this.uiMetrics.fruitSize));
  };

  private endGame(isWin = false): void {
    if (this.isDestroyed) return;
    this.isGameOver = true; this.spawnTimer?.remove(); this.healTimer?.remove();
    if (isWin) this.animateCoins(20);
    
    // Пушим финальное состояние игры в Zustand
    useCatchGameStore.getState().setGameOver(true);
  }

  private animateCoins(amount: number): void {
    const w = this.scale.width, h = this.scale.height;
    const hs = PhaserMath.Between(-Math.min(400, w * 0.4), Math.min(400, w * 0.4));
    const vs = PhaserMath.Between(120, Math.min(450, h * 0.5));

    for (let i = 0; i < amount; i++) {
      this.time.delayedCall(i * 30, () => {
        const rad = Math.max(12, Math.min(18, h * 0.024));
        const c = this.add.graphics().fillStyle(0xf9b300, 1).fillCircle(0, 0, rad).lineStyle(Math.max(2, rad * 0.15), 0xffffff, 0.5).strokeCircle(0, 0, rad).setDepth(30);
        c.x = w / 2 + PhaserMath.Between(-20, 20); c.y = h / 2 + PhaserMath.Between(-20, 20);

        this.tweens.add({
          targets: c, x: c.x + hs, y: c.y - vs, scale: 1.2, duration: 520, ease: 'Quad.easeOut',
          onComplete: () => this.tweens.add({ targets: c, y: h + 40, alpha: 0, scale: 0.5, duration: 480, ease: 'Quad.easeIn', onComplete: () => c.destroy() })
        });
      });
    }
  }
}
