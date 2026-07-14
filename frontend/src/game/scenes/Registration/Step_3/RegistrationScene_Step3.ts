import { Scene } from 'phaser';
import { renderRegistrationUI_Step3, destroyRegistrationUI_Step3 } from './RegistrationUI_Step3';
import { BackgroundManager } from '../../../../BackgroundManager';
import { RegistrationLogic_Step3 } from './RegistrationLogic_Step3';

export class RegistrationScene_Step3 extends Scene {
  private captchaLogic!: RegistrationLogic_Step3;

  constructor() { 
    super('RegistrationScene_Step3'); 
  }

  public preload = (): void => {};

  public create = (): void => {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    BackgroundManager.getInstance().applyBackground(this.scene.key);

    this.captchaLogic = new RegistrationLogic_Step3(() => {
      this.cameras.main.fadeOut(400, 0, 0, 0).once('camerafadeoutcomplete', () => {
        this.scene.start('RegistrationScene_Step4');
      });
    });

    this.buildUI();

    this.scale.on('resize', this.handleResize, this);

    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
      destroyRegistrationUI_Step3();
      BackgroundManager.getInstance().clearBackground();
    }, this);
  };

  private buildUI = (): void => {
    renderRegistrationUI_Step3(this, this.captchaLogic);
  };

  private handleResize = (): void => {
    if (!this.scene.isActive(this.scene.key)) return;
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    destroyRegistrationUI_Step3();
    this.buildUI();
  };
}
