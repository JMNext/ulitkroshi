import { Scene } from 'phaser';
import { renderLoginUI, destroyLoginUI, startLoadingAnimation } from './LoginUI';
import { BackgroundManager } from '../../../BackgroundManager';

export class LoginScene extends Scene {
  constructor() {
    super('LoginScene');
  }

  public preload = (): void => {
    this.load.image('player-begemot', '/assets/login_assets/begemot.png');
  };

  public create = (): void => {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    BackgroundManager.getInstance().applyBackground(this.scene.key);

    this.buildUI();

    window.addEventListener('resize', this.handleResizeBound);

    this.events.once('shutdown', () => {
      window.removeEventListener('resize', this.handleResizeBound);
      destroyLoginUI();
      BackgroundManager.getInstance().clearBackground();
    }, this);
  };

  private handleResizeBound = (): void => {
    if (!this.scene.isActive(this.scene.key)) return;
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    destroyLoginUI();
    this.buildUI();
  };

  private buildUI = (): void => {
    renderLoginUI(this, () => this.handleStartFlow());
  };

  private handleStartFlow = (): void => {
    startLoadingAnimation(() => {
      this.cameras.main.fadeOut(500, 0, 0, 0).once('camerafadeoutcomplete', () => {
        this.scene.start('RegistrationScene_Step1');
      });
    });
  };
}
