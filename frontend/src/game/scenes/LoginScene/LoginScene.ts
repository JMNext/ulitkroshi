import { Scene } from 'phaser';
import { renderLoginUI, destroyLoginUI, startLoadingAnimation } from './LoginUI';
import { BackgroundManager } from '../../../BackgroundManager';
import begemotUrl from '../../../assets/login_assets/begemot.png?url';

export class LoginScene extends Scene {
  constructor() {
    super('LoginScene');
  }

  preload = (): void => {
    this.load.image('player-begemot', begemotUrl);
  };

  create = (): void => {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    this.buildUI();

    this.scale.on('resize', this.handleResizeBound, this);

    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResizeBound, this);
      destroyLoginUI();
      BackgroundManager.getInstance().clearBackground();
    }, this);
  };

  handleResizeBound = (): void => {
    if (!this.sys.isActive()) return;
    BackgroundManager.getInstance().applyBackground(this.scene.key);
  };

  buildUI = (): void => {
    renderLoginUI(this, () => this.handleStartFlow());
  };

  handleStartFlow = (): void => {
    startLoadingAnimation(() => {
      if (!this.sys.isActive()) return;
      this.cameras.main.fadeOut(500, 0, 0, 0).once('camerafadeoutcomplete', () => {
        this.scene.start('RegistrationScene_Step1');
      });
    });
  };
}
