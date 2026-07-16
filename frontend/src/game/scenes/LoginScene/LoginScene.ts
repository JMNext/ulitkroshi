import { Scene, Scenes, Cameras } from 'phaser'; 
import begemotUrl from '../../../assets/login_assets/begemot.png?url';
import { destroyLoginUI, renderLoginUI, startLoadingAnimation } from './components/LoginUI';
import './components/LoginUI.css';

export class LoginScene extends Scene {
  private isTransitioning: boolean = false;

  constructor() {
    super('LoginScene');
  }

  public preload(): void {
    // Загружаем картинку в глобальный TextureManager под стабильным ключом
    if (!this.textures.exists('player-begemot')) {
      this.load.image('player-begemot', begemotUrl);
    }
  }

  public create(): void {
    this.isTransitioning = false;
    if (this.cameras?.main) {
      this.cameras.main.fadeIn(400, 0, 0, 0);
    }
    
    document.getElementById('game-container')?.setAttribute('data-scene', this.scene.key);
    this.buildUI();
    
    this.events.once(Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.events.once(Scenes.Events.DESTROY, this.handleShutdown, this);
  }

  private buildUI(): void {
    renderLoginUI(this, () => this.handleStartFlow());
  }

  private handleStartFlow(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    startLoadingAnimation(() => {
      if (!this.sys || !this.sys.isActive() || !this.scene) return;

      destroyLoginUI();

      if (this.cameras?.main) {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          if (this.sys?.isActive() && this.scene) {
            this.scene.start('RegistrationScene_Step1');
          }
        });
      } else {
        this.scene.start('RegistrationScene_Step1');
      }
    });
  }

  private handleShutdown(): void {
    destroyLoginUI();
    this.events.off(Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.events.off(Scenes.Events.DESTROY, this.handleShutdown, this);
  }
}
