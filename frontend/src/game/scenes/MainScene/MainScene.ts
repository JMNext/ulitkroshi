import { Scene } from 'phaser';
import { BackgroundManager } from '../../../BackgroundManager';
import { destroyMainBottomMenuUI, renderMainBottomMenuUI } from './MainBottomMenuUI';
import { destroyMainHeaderUI, renderMainHeaderUI } from './MainHeaderUI';
import { MainPetPosition } from './MainPetPosition';
import { destroyMainSideButtonsUI, renderMainSideButtonsUI } from './MainSideButtonsUI';
import { destroyMainHealthUI, renderMainHealthUI } from './PetHealthBar';

export class MainScene extends Scene {
  public krosh: any = null;
  private petLayout!: MainPetPosition;
  private currentWashState: 'idle' | 'hidden' | 'glowing' = 'idle';
  public currentHp: number = 100;
  private resizeTimeout: any = null;

  constructor() {
    super('MainScene');
  }

  public preload = (): void => {
    const IMAGES = {
      'icon-foto': 'interface-icons/foto.svg',
      'icon-life': 'interface-icons/life.svg',
      'icon-minigame': 'interface-icons/mini-game.svg',
      'icon-mypets': 'interface-icons/my-pets.svg',
      'icon-shop': 'interface-icons/shop.svg',
      'icon-avatar': 'interface-icons/icon-avatar.svg',
      'icon-plus': 'interface-icons/plus.svg',
      'bg-interface-btn': 'interface-icons/button.svg',
      'icon-eat': 'buttom_menu-icons/eat.svg',
      'icon-wash': 'buttom_menu-icons/wash.svg',
      'icon-play': 'buttom_menu-icons/play.svg',
      'icon-sleep': 'buttom_menu-icons/sleep.svg',
      'bg-menu-btn': 'buttom_menu-icons/button.svg',
    };
    Object.entries(IMAGES).forEach(([k, v]) => {
      if (!this.textures.exists(k)) this.load.image(k, `/assets/${v}`);
    });

    const VIDEOS = {
      prostoi1: 'prostoi-converted.webm',
      prostoi2: 'prostoi2.webm',
      eat: 'eat-converted.webm',
      wash: 'wash-converted.webm',
      play: 'играть_отталкивает мяч.webm',
      sleep_begin: 'sleep_begin.webm',
      sleep_circle: 'sleep_circle.webm',
      sleep_awake: 'sleep_awake.webm'
    };
    Object.entries(VIDEOS).forEach(([k, v]) => {
      if (!this.cache.video.exists(k)) this.load.video(k, `/assets/resources/1stpet-animation/${v}`);
    });
  };

  public create = (): void => {
    this.cameras.main.fadeIn(500, 0, 0, 0);
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    this.petLayout = new MainPetPosition(this);
    this.petLayout.setupPosition();
    this.buildUI();

    window.addEventListener('resize', this.handleResizeBound);

    this.events.once('shutdown', () => {
      window.removeEventListener('resize', this.handleResizeBound);
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
      this.destroyUI();
      if (this.petLayout) this.petLayout.clear();
      BackgroundManager.getInstance().clearBackground();
    }, this);
  };

  private handleResizeBound = (): void => {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      if (!this.scene.isActive(this.scene.key)) return;
      BackgroundManager.getInstance().applyBackground(this.scene.key);
      this.petLayout.updateOnResize();
      renderMainHeaderUI(this);
      renderMainSideButtonsUI(this);
      renderMainBottomMenuUI(this);
    }, 30);
  };

  private buildUI = (): void => {
    renderMainHeaderUI(this);
    renderMainSideButtonsUI(this);
    renderMainBottomMenuUI(this);
    if (this.petLayout && typeof this.petLayout.syncHealthBarPosition === 'function') {
      this.petLayout.syncHealthBarPosition();
    } else {
      this.updateHealthBarPosition('idle');
    }
  };

  private destroyUI = (): void => {
    destroyMainHeaderUI();
    destroyMainHealthUI();
    destroyMainSideButtonsUI();
    destroyMainBottomMenuUI();
  };

  public updateHealthBarPosition = (washState?: 'idle' | 'hidden' | 'glowing'): void => {
    if (washState) this.currentWashState = washState;
    if (this.petLayout && typeof this.petLayout.syncHealthBarPosition === 'function') {
      this.petLayout.syncHealthBarPosition();
    } else {
      renderMainHealthUI(120, 1.0, this.currentWashState, this.currentHp);
    }
  };

  private playSequence = (animKey: string, duration: number): void => {
    if (!this.krosh) return;
    this.updateHealthBarPosition('hidden');
    this.krosh.playAnim(animKey, false);
    this.time.delayedCall(duration, () => {
      if (this.krosh?.currentAnimation === animKey || this.krosh?.idleKeys.includes(this.krosh?.currentAnimation)) {
        this.updateHealthBarPosition('glowing');
        this.time.delayedCall(1000, () => this.updateHealthBarPosition('idle'));
      }
    });
  };

  public playWashSequence = (): void => {
    this.playSequence('wash', 4000);
  };
  public playPlaySequence = (): void => {
    this.playSequence('play', 2000);
  };

  public getMenuY = (): number => {
    const w = window.innerWidth;
    const isPort = w < window.innerHeight;
    return window.innerHeight - ((isPort ? 285 : 260) * (w / (isPort ? 1080 : 1920)));
  };
}
