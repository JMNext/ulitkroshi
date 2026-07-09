import Phaser, { Scene } from 'phaser';
import {
  createCatchBackground,
  createCatchHeader,
  updateCatchHealthBar,
  createPlayer,
  createCatchControls,
  showGameOverModal
} from '../../utils/effects/CatchGameEffects';
import { animateCoinExplosion } from '../../utils/effects/MemoryGameEffects';

export class CatchGameScene extends Scene {
  constructor() {
    super('CatchGameScene');
  }

  init(data) {
    this.difficulty = data.difficulty || 'medium';
    this.score = 0;
    this.hp = 100;
    this.isGameOver = false;
    this.fruitsGroup = [];
    this.spawnTimer = null;
    this.moveDirection = 0; 
    this.playerSpeed = 14; 

    this.difficultyConfigs = {
      easy: { speed: 5, delay: 1600 },
      medium: { speed: 8, delay: 1200 },
      hard: { speed: 11, delay: 800 }
    };

    const activeConfig = this.difficultyConfigs[this.difficulty];
    this.fruitSpeed = activeConfig.speed;
    this.spawnDelay = activeConfig.delay;
  }

  preload() {
    this.load.image('bg-jungli', '/assets/resources/background_jungli.png');
    this.load.image('player-begemot', '/assets/login_assets/begemot.png');
    this.load.image('icon-life', '/assets/login_assets/life.svg');
    const fruits = ['01', '02', '03', '04', '05', '06', '07', '08', '10', '11', '12', '14', '15', '16'];
    fruits.forEach(id => this.load.image(`fruit-${id}`, `/assets/фрукты/fruits_${id}.png`));
  }

  create() {
    createCatchBackground(this);
    createCatchHeader(this);
    this.player = createPlayer(this);
    createCatchControls(this); 

    const minBoundsX = 140;
    const maxBoundsX = this.scale.width - 140;
    const controlsAreaY = this.scale.height - 280; // Зона кнопок управления снизу

    // ИНПУТ 1: Плавное ведение пальцем/курсором мыши по экрану
    this.input.on('pointermove', (pointer) => {
      if (this.isGameOver) return;
      // ИСПРАВЛЕНО: Бегемот не двигается за пальцем, если ведут в зоне кнопок управления
      if (pointer.y > controlsAreaY) return;
      this.player.x = Phaser.Math.Clamp(pointer.x, minBoundsX, maxBoundsX);
    });

    // ИНПУТ 2: Мгновенный тап/клик мышкой в любую пустую точку поля
    this.input.on('pointerdown', (pointer) => {
      if (this.isGameOver) return;
      // ИСПРАВЛЕНО: Игнорируем клики в нижней зоне экрана, чтобы бегемот не телепортировался при нажатии на стрелки
      if (pointer.y > controlsAreaY) return;
      this.player.x = Phaser.Math.Clamp(pointer.x, minBoundsX, maxBoundsX);
    });

    this.spawnTimer = this.time.addEvent({ 
      delay: this.spawnDelay, 
      loop: true, 
      callback: () => this.spawnFruit() 
    });
  }

  spawnFruit() {
    if (this.isGameOver) return;
    const { width } = this.scale;
    const fruitKeys = ['01', '02', '03', '04', '05', '06', '07', '08', '10', '11', '12', '14', '15', '16'];
    const randomKey = `fruit-${Phaser.Utils.Array.GetRandom(fruitKeys)}`;
    const fruit = this.add.image(Phaser.Math.Between(100, width - 100), -100, randomKey).setDisplaySize(110, 110).setDepth(4);
    this.fruitsGroup.push(fruit);
  }

  update() {
    if (this.isGameOver) return;
    const { width, height } = this.scale;

    // ИНПУТ 3: Непрерывное перемещение по зажатым на экране стрелочкам
    if (this.moveDirection !== 0) {
      this.player.x += this.moveDirection * this.playerSpeed;
      this.player.x = Phaser.Math.Clamp(this.player.x, 140, width - 140);
    }

    for (let i = this.fruitsGroup.length - 1; i >= 0; i--) {
      const fruit = this.fruitsGroup[i];
      fruit.y += this.fruitSpeed;

      if (Phaser.Math.Distance.Between(fruit.x, fruit.y, this.player.x, this.player.y) < 140) {
        fruit.destroy();
        this.fruitsGroup.splice(i, 1);
        this.score++;
        this.scoreText.setText(`СЧЕТ: ${this.score}`);
        
        if (this.score >= 100) {
          this.endGame(true);
          return;
        }

        if (this.score % 10 === 0) {
          this.fruitSpeed += (this.difficulty === 'easy' ? 0.8 : 1.5);
        }
        continue;
      }

      if (fruit.y > height - 180) {
        fruit.destroy();
        this.fruitsGroup.splice(i, 1);
        this.hp -= 25;
        updateCatchHealthBar(this, this.hp);
        if (this.hp <= 0) this.endGame(false);
      }
    }
  }

  endGame(isMaxScore = false) {
    this.isGameOver = true;
    if (this.spawnTimer) this.spawnTimer.remove();
    this.fruitsGroup.forEach(f => f.destroy());
    this.fruitsGroup = [];

    const earnedCoins = isMaxScore ? 20 : Math.floor(this.score * 0.2);
    const currentCoins = this.registry.get('coins') || 0;
    this.registry.set('coins', currentCoins + earnedCoins);

    const finalHpForMainScreen = this.hp <= 0 ? 10 : this.hp;
    this.registry.set('hp', finalHpForMainScreen);

    if (earnedCoins > 0) animateCoinExplosion(this, earnedCoins);

    this.time.delayedCall(earnedCoins > 0 ? 1200 : 0, () => {
      showGameOverModal(this, this.score);
    });
  }
}
