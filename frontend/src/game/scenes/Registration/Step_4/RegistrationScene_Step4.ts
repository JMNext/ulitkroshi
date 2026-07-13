import { Scene } from 'phaser';
import { renderRegistrationUI_Step4, destroyRegistrationUI_Step4 } from './RegistrationUI_Step4';
import { BackgroundManager } from '../../../../BackgroundManager';

export class RegistrationScene_Step4 extends Scene {
  constructor() { 
    super('RegistrationScene_Step4'); 
  }

  public preload = (): void => {};

  public create = (): void => {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    this.buildUI();

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
      destroyRegistrationUI_Step4();
      BackgroundManager.getInstance().clearBackground();
    }, this);
  };

  private buildUI = (): void => {
    renderRegistrationUI_Step4(() => {
      this.cameras.main.fadeOut(500, 0, 0, 0).once('camerafadeoutcomplete', () => {
        this.scene.start('MainScene');
      });
    });
  };

  private handleResize = (): void => {
    if (!this.scene.isActive(this.scene.key)) return;
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    destroyRegistrationUI_Step4();
    this.buildUI();
  };
}
