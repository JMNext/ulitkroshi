import { Scene } from 'phaser';
import { RegistrationLogic_Step2 } from './RegistrationLogic_Step2';
import { BackgroundManager } from '../../../../BackgroundManager';

export class RegistrationScene_Step2 extends Scene {
  private registrationLogic: RegistrationLogic_Step2 | null = null;

  constructor() { 
    super('RegistrationScene_Step2'); 
  }

  public preload = (): void => {};

  public create = (): void => {
    this.cameras.main.fadeIn(400, 0, 0, 0);
    BackgroundManager.getInstance().applyBackground(this.scene.key);
    this.buildUI();

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', this.handleShutdown, this);
  };

  private buildUI = (): void => {
    this.registrationLogic = new RegistrationLogic_Step2(this, () => {
      if (this.cameras && this.cameras.main) {
        this.cameras.main.fadeOut(500, 0, 0, 0).once('camerafadeoutcomplete', () => {
          this.scene.start('RegistrationScene_Step3');
        });
      }
    });
  };

  private handleResize = (): void => {
    if (!this.scene.isActive(this.scene.key)) return;
    BackgroundManager.getInstance().applyBackground(this.scene.key);
  };

  private handleShutdown = (): void => {
    this.scale.off('resize', this.handleResize, this);
    if (this.registrationLogic) {
      this.registrationLogic.destroy(false); // Защита: передаем false
      this.registrationLogic = null;
    }
    BackgroundManager.getInstance().clearBackground();
  };
}
