import { Scene } from 'phaser';
// Подключаем эффекты из нового изолированного файла авторизации
import { createLoadingBar, createLoginButton } from '../../utils/effects/LoginSceneEffects';

export class LoginScene extends Scene {
  constructor() {
    super('LoginScene');
  }

  preload() {
    this.load.image('bg-login-full', '/assets/login_assets/login.png');
  }

  create() {
    console.log('LoginScene: Старт экрана с цельного статичного арта');

    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    const bg = this.add.image(centerX, centerY, 'bg-login-full');
    bg.setDisplaySize(width, height).setDepth(0);

    this.cameras.main.fadeIn(400, 0, 0, 0);

    const buttonY = height * 0.84;

    createLoginButton(this, centerX, buttonY, () => {
      createLoadingBar(this, centerX, buttonY, () => {
        this.transitionToNextScene();
      });
    });
  }

  transitionToNextScene() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
    });
  }
}
