import { Scene } from 'phaser';
import { useMemoryGameStore } from './useMemoryGameStore';
import { MemoryGameUiManager } from './MemoryGameUiManager';

import fonGorizImg from '/src/assets/background/fon_goriz.png';
import fonVertImg from '/src/assets/background/fon_vert.png';

const FRUITS_POOL = ['01', '02', '03', '04', '05', '06', '07', '08', '10', '11', '12', '14', '15', '16'];

export class MemoryGameScene extends Scene {
  public uiManager!: MemoryGameUiManager;
  private bgImage: Phaser.GameObjects.Image | null = null; 
  private unsubscribeStore: (() => void) | null = null;
  private resizeTimeout: any = null;
  public difficulty = 'medium'; 
  public totalPairs = 6;

  constructor() { super('MemoryGameScene'); }

  public init(data: { difficulty?: 'easy' | 'medium' | 'hard' }): void {
    this.difficulty = data.difficulty || 'medium';
    this.totalPairs = { easy: 4, medium: 6, hard: 8 }[this.difficulty] || 6;
    this.uiManager = new MemoryGameUiManager(this);
    useMemoryGameStore.getState().initGame(this.totalPairs, FRUITS_POOL);
  }

  public preload(): void {
    this.load.image('memory_bg_horiz', fonGorizImg).image('memory_bg_vert', fonVertImg);
  }

  public create(): void {
    document.getElementById('game-container')?.setAttribute('data-scene', this.scene.key);
    this.bgImage = this.add.image(0, 0, 'memory_bg_horiz').setOrigin(0, 0); 
    this.executeBackgroundResize();
    
    this.uiManager.createUiContainer();
    this.uiManager.render();

    // Безопасная подписка на изменение стейта Zustand
    this.unsubscribeStore = useMemoryGameStore.subscribe(
      s => `${s.score}-${s.isGameOver}-${s.canClick}-${s.isWash}`, 
      () => this.uiManager?.render()
    );

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleResize);

    // Главное исправление утечек памяти: чистим ресурсы по событию выключения сцены
    this.events.once('shutdown', () => {
      this.cleanup();
    });
  }

  private handleResize = (): void => { 
    clearTimeout(this.resizeTimeout); 
    this.resizeTimeout = setTimeout(() => this.executeBackgroundResize(), 150); 
  };

  private executeBackgroundResize(): void {
    if (!this.bgImage || !this.uiManager) return;
    const [w, h] = [window.innerWidth, window.innerHeight];
    this.scale.resize(w, h); 
    this.bgImage.setTexture(h > w ? 'memory_bg_vert' : 'memory_bg_horiz').setDisplaySize(w, h);
    this.uiManager.render();
  }

  public restartGame(): void {
    this.scene.restart({ difficulty: this.difficulty });
  }

  public exitGameSession(): void { 
    this.scene.start('MainScene'); 
  }

  private cleanup(): void {
    clearTimeout(this.resizeTimeout);
    window.removeEventListener('resize', this.handleResize); 
    window.removeEventListener('orientationchange', this.handleResize);
    
    this.unsubscribeStore?.(); 
    this.uiManager?.destroy(); 
    useMemoryGameStore.getState().resetStore();
  }
}
