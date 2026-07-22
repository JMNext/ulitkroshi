import { Scene } from 'phaser';
import React from 'react';
import { useSnakeGameStore } from './useSnakeGameStore';
import { SnakeGameLogicManager } from './SnakeGameLogicManager';
import { SnakeGameUiManager } from './SnakeGameUiManager';
import { SnakePetEntity } from './components/SnakePetEntity';

import fonGorizImg from '/src/assets/background/fon_goriz.png';
import fonVertImg from '/src/assets/background/fon_vert.png';
import petIdleVideo from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';
import petPlayVideo from '/src/assets/resources/1stpet-animation/play-converted.webm';
import petSadVideo from '/src/assets/resources/1stpet-animation/sad_state.webm';
import { localGetFruitUrl } from '../MemoryGame/MemoryGameScene';

const FP = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];

export class SnakeGameScene extends Scene {
  public difficulty = 'medium'; score = 0; hp = 100; petVideoSrc = petIdleVideo;
  private bgImage: Phaser.GameObjects.Image | null = null; private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  public logicManager!: SnakeGameLogicManager; private uiManager!: SnakeGameUiManager; private petEntity!: SnakePetEntity;
  private unsubscribeStore: (() => void) | null = null; private handleWindowResizeBound: () => void; private resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  private uncrashTime = 0;

  constructor() { super('SnakeGameScene'); this.handleWindowResizeBound = this.handleWindowResize.bind(this); }

  public init(data: { difficulty?: 'easy' | 'medium' | 'hard' }): void {
    this.difficulty = data.difficulty || 'medium'; this.score = 0; this.hp = 100;
    const SC = { easy: 340, medium: 200, hard: 120 };
    this.logicManager = new SnakeGameLogicManager(this, SC[this.difficulty as 'easy' | 'medium' | 'hard'] || 200);
    this.uiManager = new SnakeGameUiManager(this); this.petEntity = new SnakePetEntity(this);
    useSnakeGameStore.getState().initGame();
  }

  public preload(): void {
    this.load.image('snake_bg_horiz', fonGorizImg).image('snake_bg_vert', fonVertImg);
    FP.forEach((id, idx) => this.load.image(`fruit_idx_${idx}`, localGetFruitUrl(id)));
  }

  public create(): void {
    document.getElementById('game-container')?.setAttribute('data-scene', this.scene.key);
    this.bgImage = this.add.image(0, 0, 'snake_bg_horiz').setOrigin(0, 0); this.executeBackgroundResize();
    this.uiManager.createUiContainer();
    const isPortrait = window.innerHeight > window.innerWidth;
    this.petEntity.create({ idle: petIdleVideo, play: petPlayVideo, sad: petSadVideo });
    this.logicManager.initGame(isPortrait);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (useSnakeGameStore.getState().isGameOver || !this.logicManager.snake[0]) return;
      const h = this.logicManager.snake[0];
      const hX = this.logicManager.startX + h.x * this.logicManager.cellSize + this.logicManager.cellSize / 2, hY = this.logicManager.startY + h.y * this.logicManager.cellSize + this.logicManager.cellSize / 2;
      const dX = pointer.x - hX, dY = pointer.y - hY;
      if (Math.abs(dX) > Math.abs(dY)) this.logicManager.changeDirection(dX > 0 ? 'RIGHT' : 'LEFT');
      else this.logicManager.changeDirection(dY > 0 ? 'DOWN' : 'UP');
    });

    this.uiManager.render();
    this.unsubscribeStore = useSnakeGameStore.subscribe(state => state.isGameOver, (isGameOver) => {
      if (isGameOver) { this.uiManager.render(); if (useSnakeGameStore.getState().score >= 20) this.triggerWinCoinsExplosion(); }
    });
    if (this.input.keyboard) this.cursors = this.input.keyboard.createCursorKeys();
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('resize', this.handleWindowResizeBound);
    window.addEventListener('orientationchange', this.handleWindowResizeBound);
  }

  public update(time: number): void {
    const store = useSnakeGameStore.getState(); if (store.isGameOver) return;
    if (store.isCrashed) {
      if (time > this.uncrashTime) {
        useSnakeGameStore.getState().updateGameState(this.score, this.hp, false, false, false, false);
        this.petEntity.setVideoState('idle'); this.logicManager.resetPositionOnCrash(); this.uiManager.render();
      }
      return;
    }
    if (this.cursors) {
      if (this.cursors.left.isDown && this.logicManager.dir !== 'RIGHT') this.logicManager.changeDirection('LEFT');
      else if (this.cursors.right.isDown && this.logicManager.dir !== 'LEFT') this.logicManager.changeDirection('RIGHT');
      else if (this.cursors.up.isDown && this.logicManager.dir !== 'DOWN') this.logicManager.changeDirection('UP');
      else if (this.cursors.down.isDown && this.logicManager.dir !== 'UP') this.logicManager.changeDirection('DOWN');
    }
    this.logicManager.handleTicks(time);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const DM: Record<string, string> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT', W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT' };
    if (e && DM[e.key] && this.logicManager) this.logicManager.changeDirection(DM[e.key]);
  };

  public addScore(): void {
    this.score++; const isWin = this.score >= 20;
    useSnakeGameStore.getState().updateGameState(this.score, this.hp, isWin, isWin, true, false);
    this.petEntity.setVideoState('play'); this.uiManager.render();
  }

  public triggerCrash(time: number): void {
    this.hp = Math.max(0, this.hp - 25); const isOver = this.hp <= 0;
    useSnakeGameStore.getState().updateGameState(this.score, this.hp, isOver, false, false, !isOver);
    this.petEntity.setVideoState('sad'); this.uiManager.render(); this.uncrashTime = time + 1500;
  }

  public onPetPlayEnded(): void { if (!useSnakeGameStore.getState().isCrashed) this.petEntity.setVideoState('idle'); }
  public onPetSadEnded(): void {}

  private handleWindowResize(): void { if (this.resizeTimeout) clearTimeout(this.resizeTimeout); this.resizeTimeout = setTimeout(() => this.executeBackgroundResize(), 150); }

  private executeBackgroundResize(): void {
    if (!this.bgImage || !this.scale) return;
    const w = window.innerWidth, h = window.innerHeight, isPortrait = h > w;
    this.scale.resize(w, h); this.bgImage.setTexture(isPortrait ? 'snake_bg_vert' : 'snake_bg_horiz').setPosition(0, 0).setDisplaySize(w, h);
    if (this.logicManager) this.logicManager.resizeMetrics(isPortrait);
    if (this.petEntity) this.petEntity.resize(isPortrait);
    if (this.uiManager) this.uiManager.render();
  }

  private cleanup = (): void => {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    window.removeEventListener('keydown', this.handleKeyDown); window.removeEventListener('resize', this.handleWindowResizeBound); window.removeEventListener('orientationchange', this.handleWindowResizeBound);
    if (this.unsubscribeStore) this.unsubscribeStore();
    this.logicManager.destroy(); this.petEntity.destroy(); this.uiManager.destroy(); useSnakeGameStore.getState().resetStore();
  };

  public exitGame(): void { this.cleanup(); this.scene.start('MainScene'); }

  public triggerWinCoinsExplosion(): void {
    const w = this.scale.width, h = this.scale.height;
    for (let i = 0; i < 20; i++) {
      this.time.delayedCall(i * 30, () => {
        if (!this.scene.isActive(this.scene.key)) return;
        const c = this.add.graphics().fillStyle(0xf9b300, 1).fillCircle(0, 0, 14).setDepth(30); c.x = w / 2; c.y = h / 2;
        this.tweens.add({
          targets: c, x: c.x + Phaser.Math.Between(-150, 150), y: c.y - Phaser.Math.Between(100, 300), scale: 1.2, duration: 520, ease: 'Quad.easeOut',
          onComplete: () => this.tweens.add({ targets: c, y: h + 40, alpha: 0, scale: 0.5, duration: 480, ease: 'Quad.easeIn', onComplete: () => c.destroy() })
        });
      });
    }
  }
}
