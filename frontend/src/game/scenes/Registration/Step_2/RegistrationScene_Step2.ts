import { Scene } from 'phaser';
import { renderRegistrationUI_Step2, destroyRegistrationUI_Step2 } from './RegistrationUI_Step2';
import { BackgroundManager } from '../../../../BackgroundManager';

export class RegistrationScene_Step2 extends Scene {
  constructor() { 
    super('RegistrationScene_Step2'); 
  }

  public preload = (): void => {};

  public create = (): void => {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    this.buildUI();

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
      destroyRegistrationUI_Step2();
      BackgroundManager.getInstance().clearBackground();
    }, this);
  };

  private buildUI = (): void => {
    renderRegistrationUI_Step2(this, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0).once('camerafadeoutcomplete', () => {
        this.scene.start('RegistrationScene_Step3');
      });
    });
  };

  private handleResize = (): void => {
    if (!this.scene.isActive(this.scene.key)) return;
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    destroyRegistrationUI_Step2();
    this.buildUI();
  };
}
