import { Scene } from 'phaser';
import { useCatchGameStore } from './useCatchGameStore';
import { CatchGamePhysicsManager } from './CatchGamePhysicsManager';
import { CatchGameUiManager } from './CatchGameUiManager';
import { CatchGamePet } from './components/CatchGamePet';

import fonGorizImg from '/src/assets/background/fon_goriz.png';
import fonVertImg from '/src/assets/background/fon_vert.png';
import petVideoUrl from '/src/assets/resources/1stpet-animation/prostoi-converted.webm';
import { localGetFruitUrl } from '../MemoryGame/MemoryGameScene';

const FRUITS = ['01', '02', '0003_13', '03', '04', '05', '06', '0007_09', '07', '08', '10', '11', '12', '14', '15', '16'];

export class CatchGameScene extends Scene {
  public difficulty = 'medium';
  public score = 0;
  public hp = 100;
  public petVideoSrc = petVideoUrl;

  private bgImage: Phaser.GameObjects.Image | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  
  public physicsManager!: CatchGamePhysicsManager;
  private uiManager!: CatchGameUiManager;
  public petEntity!: CatchGamePet;
  private unsubscribeStore: (() => void) | null = null;
  private handleWindowResizeBound: () => void;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super('CatchGameScene');
    this.handleWindowResizeBound = this.handleWindowResize.bind(this);
  }

  public init(data: { difficulty?: 'easy' | 'medium' | 'hard' }): void {
    this.difficulty = data.difficulty || 'medium';
    this.score = 0;
    this.hp = 100;

    const cfgs: Record<string, { speed: number; delay: number }> = {
      easy: { speed: 5, delay: 1400 },
      medium: { speed: 7, delay: 1000 },
      hard: { speed: 10, delay: 700 }
    };
    const cfg = cfgs[this.difficulty] || cfgs.medium;
    
    this.physicsManager = new CatchGamePhysicsManager(this, cfg.speed, cfg.delay);
    this.uiManager = new CatchGameUiManager(this);
    this.petEntity = new CatchGamePet(this);

    useCatchGameStore.getState().initGame();
  }

  public preload(): void {
    this.load.image('catch_bg_horiz', fonGorizImg);
    this.load.image('catch_bg_vert', fonVertImg);
    FRUITS.forEach(id => this.load.image(`fruit_${id}`, localGetFruitUrl(id)));
  }

  public create(): void {
    document.getElementById('game-container')?.setAttribute('data-scene', this.scene.key);

    this.bgImage = this.add.image(0, 0, 'catch_bg_horiz').setOrigin(0, 0);
    this.executeBackgroundResize();

    this.uiManager.createUiContainer();
    
    const isPortrait = window.innerHeight > window.innerWidth;
    this.petEntity.create(isPortrait, this.petVideoSrc);
    this.physicsManager.initPhysics(isPortrait);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    this.uiManager.render();

    this.unsubscribeStore = useCatchGameStore.subscribe(
      (state) => state.isGameOver,
      (isGameOver) => {
        if (isGameOver) {
          this.physicsManager.pausePhysics();
          this.petEntity.pause();
          this.petEntity.hide();
          this.uiManager.render();
          if (useCatchGameStore.getState().isWin) this.triggerWinCoinsExplosion();
        }
      }
    );

    window.addEventListener('resize', this.handleWindowResizeBound);
    window.addEventListener('orientationchange', this.handleWindowResizeBound);
  }

  public update(time: number): void {
    if (useCatchGameStore.getState().isGameOver) return;

    const pointer = this.input.activePointer;
    const halfWidth = this.petEntity.width / 2;
    const minBounds = halfWidth;
    const maxBounds = this.scale.width - halfWidth;
    
    if (pointer.isDown || pointer.deltaX !== 0 || pointer.deltaY !== 0) {
      const clampedX = Math.max(minBounds, Math.min(maxBounds, pointer.x));
      this.petEntity.updatePosition(clampedX);
    }

    const speed = 18;
    if (this.cursors?.left.isDown) {
      const clampedX = Math.max(minBounds, Math.min(maxBounds, this.petEntity.x - speed));
      this.petEntity.updatePosition(clampedX);
    } else if (this.cursors?.right.isDown) {
      const clampedX = Math.max(minBounds, Math.min(maxBounds, this.petEntity.x + speed));
      this.petEntity.updatePosition(clampedX);
    }

    this.physicsManager.updatePhysics(time, this.petEntity);
  }

  public addScore(): void {
    const state = useCatchGameStore.getState();
    this.score += 1;
    const isWin = this.score >= 20;
    const isGameOver = this.hp <= 0 || isWin;
    useCatchGameStore.getState().updateGameState(this.score, this.hp, isGameOver, isWin);
    this.uiManager.render();
  }

  public loseHp(): void {
    const state = useCatchGameStore.getState();
    this.hp = Math.max(0, this.hp - 20);
    const isGameOver = this.hp <= 0 || this.score >= 20;
    useCatchGameStore.getState().updateGameState(this.score, this.hp, isGameOver, state.isWin);
    this.uiManager.render();
  }

  private handleWindowResize(): void {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.executeBackgroundResize();
    }, 150);
  }

  private executeBackgroundResize(): void {
    if (this.bgImage && this.scale) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width;

      this.scale.resize(width, height);
      this.bgImage.setTexture(isPortrait ? 'catch_bg_vert' : 'catch_bg_horiz');
      this.bgImage.setPosition(0, 0);
      this.bgImage.setDisplaySize(width, height);

      if (this.petEntity) {
        this.petEntity.resize(width, height, isPortrait);
      }
      if (this.physicsManager) {
        this.physicsManager.resizeMetrics(isPortrait);
      }
      if (this.uiManager) {
        this.uiManager.render();
      }
    }
  }

  private cleanup = (): void => {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    window.removeEventListener('resize', this.handleWindowResizeBound);
    window.removeEventListener('orientationchange', this.handleWindowResizeBound);

    if (this.unsubscribeStore) this.unsubscribeStore();
    this.physicsManager.destroy();
    this.petEntity.destroy();
    this.uiManager.destroy();
    useCatchGameStore.getState().resetStore();
  };

  public exitGame(): void {
    this.cleanup();
    this.scene.start('MainScene');
  }

  public triggerWinCoinsExplosion(): void {
    const w = window.innerWidth, h = window.innerHeight;
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
