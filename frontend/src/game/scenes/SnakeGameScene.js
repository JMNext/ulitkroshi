import Phaser, { Scene } from 'phaser';
import { createSnakeBackground } from '../../utils/effects/SnakeGameEffects';
import { drawPlayGrid } from '../../utils/effects/SnakeGameEffects';
import { createSnakeHeader } from '../../utils/effects/SnakeGameEffects';
import { createMobileControls } from '../../utils/effects/SnakeGameEffects';
import { showSnakeGameOver } from '../../utils/effects/SnakeGameEffects';
import { animateCoinExplosion } from '../../utils/effects/MemoryGameEffects';

export class SnakeGameScene extends Scene {
  constructor() {
    super('SnakeGameScene');
  }

  init(data) {
    this.difficulty = data.difficulty || 'medium';
    this.score = 0;
    this.isGameOver = false;
    this.gridSize = 60;
    this.snake = [];
    this.dir = 'RIGHT';
    this.nextDir = 'RIGHT';
    this.moveTimer = 0;
    this.fruit = null;

    this.speeds = {
      easy: 250,
      medium: 160,
      hard: 100
    };
    this.moveInterval = this.speeds[this.difficulty];
  }

  preload() {
    this.load.image('bg-jungli', '/assets/resources/background_jungli.png');
    const fruits = ['01', '02', '03', '04', '05', '06', '07', '08', '10', '11', '12', '14', '15', '16'];
    fruits.forEach(id => this.load.image(`fruit-${id}`, `/assets/фрукты/fruits_${id}.png`));
  }

  create() {
    createSnakeBackground(this);
    
    this.minGridX = 1;
    this.maxGridX = 16; 
    this.minGridY = 5;  
    this.maxGridY = 23; 

    drawPlayGrid(this, this.minGridX, this.maxGridX, this.minGridY, this.maxGridY, this.gridSize);
    
    createSnakeHeader(this);
    createMobileControls(this);

    const startX = 7 * this.gridSize;
    const startY = 12 * this.gridSize;

    // Инициализация начального тела змейки (длина: 3 сегмента)
    for (let i = 0; i < 3; i++) {
      const segment = this.add.graphics().fillStyle(0x61aa05, 1).fillRoundedRect(0, 0, this.gridSize - 4, this.gridSize - 4, 12);
      segment.x = startX - (i * this.gridSize);
      segment.y = startY;
      segment.setDepth(5);
      this.snake.push(segment);
    }

    this.spawnFruit();

    // Слушатель управления с клавиатуры
    this.input.keyboard.on('keydown', (e) => {
      if (e.key === 'ArrowUp') this.changeDirection('UP');
      if (e.key === 'ArrowDown') this.changeDirection('DOWN');
      if (e.key === 'ArrowLeft') this.changeDirection('LEFT');
      if (e.key === 'ArrowRight') this.changeDirection('RIGHT');
    });

    // Очистка ресурсов при закрытии/переключении сцены
    this.events.on('shutdown', () => {
      if (this.petGamerVideo) {
        this.petGamerVideo.stop();
        this.petGamerVideo.destroy();
      }
    }, this);
  }

  changeDirection(newDir) {
    if (newDir === 'UP' && this.dir !== 'DOWN') this.nextDir = 'UP';
    if (newDir === 'DOWN' && this.dir !== 'UP') this.nextDir = 'DOWN';
    if (newDir === 'LEFT' && this.dir !== 'RIGHT') this.nextDir = 'LEFT';
    if (newDir === 'RIGHT' && this.dir !== 'LEFT') this.nextDir = 'RIGHT';
  }

  spawnFruit() {
    if (this.fruit) this.fruit.destroy();
    const fruitKeys = ['01', '02', '03', '04', '05', '06', '07', '08', '10', '11', '12', '14', '15', '16'];
    const randomKey = `fruit-${Phaser.Utils.Array.GetRandom(fruitKeys)}`;

    let validPos = false;
    let rx, ry;

    while (!validPos) {
      rx = Phaser.Math.Between(this.minGridX, this.maxGridX) * this.gridSize;
      ry = Phaser.Math.Between(this.minGridY, this.maxGridY) * this.gridSize;
      
      // Проверяем, чтобы фрукт не заспавнился внутри тела змейки
      validPos = !this.snake.some(seg => seg.x === rx && seg.y === ry);
    }

    this.fruit = this.add.image(rx + this.gridSize / 2, ry + this.gridSize / 2, randomKey);
    this.fruit.setDisplaySize(this.gridSize - 6, this.gridSize - 6).setDepth(4);
    this.fruit.gridX = rx;
    this.fruit.gridY = ry;
  }

  update(time) {
    if (this.isGameOver) return;
    if (time >= this.moveTimer) {
      this.moveSnake();
      this.moveTimer = time + this.moveInterval;
    }
  }

  moveSnake() {
    this.dir = this.nextDir;

    if (this.snake.length === 0) return;
    
    // ИСПРАВЛЕНО: Теперь берем координаты из первого элемента массива (головы)
    let headX = this.snake[0].x;
    let headY = this.snake[0].y;

    if (this.dir === 'UP') headY -= this.gridSize;
    if (this.dir === 'DOWN') headY += this.gridSize;
    if (this.dir === 'LEFT') headX -= this.gridSize;
    if (this.dir === 'RIGHT') headX += this.gridSize;

    // Проверка столкновения с границами игрового поля или собственным хвостом
    if (headX < this.minGridX * this.gridSize || headX > this.maxGridX * this.gridSize ||
        headY < this.minGridY * this.gridSize || headY > this.maxGridY * this.gridSize ||
        this.snake.some(seg => seg.x === headX && seg.y === headY)) {
      this.endGame(false);
      return;
    }

    // Отрисовка нового сегмента головы на вычисленной позиции
    const newHead = this.add.graphics().fillStyle(0x61aa05, 1).fillRoundedRect(0, 0, this.gridSize - 4, this.gridSize - 4, 12);
    newHead.x = headX;
    newHead.y = headY;
    newHead.setDepth(5);
    
    // Вставляем новую голову в начало массива змейки
    this.snake.unshift(newHead);

    // Логика поедания фрукта
    if (headX === this.fruit.gridX && headY === this.fruit.gridY) {
      this.score++;
      this.scoreText.setText(`СЧЕТ: ${this.score}`);
      if (this.score >= 100) {
        this.endGame(true);
        return;
      }
      this.spawnFruit();
    } else {
      // ИСПРАВЛЕНО: Если фрукт не съеден, отрезаем и уничтожаем старый хвост
      const tail = this.snake.pop();
      if (tail) tail.destroy();
    }
  }

  endGame(isMaxScore = false) {
    this.isGameOver = true;
    
    const earnedCoins = isMaxScore ? 20 : Math.floor(this.score * 0.2);
    const currentCoins = this.registry.get('coins') || 0;
    this.registry.set('coins', currentCoins + earnedCoins);

    const currentHp = this.registry.get('hp') || 100;
    this.registry.set('hp', Math.min(currentHp + (this.score * 5), 100));

    if (earnedCoins > 0) animateCoinExplosion(this, earnedCoins);

    this.time.delayedCall(earnedCoins > 0 ? 1200 : 0, () => {
      if (this.petGamerVideo) {
        
        this.petGamerVideo.stop();
        this.petGamerVideo.destroy();
      }
      showSnakeGameOver(this, this.score);
    });
  }
}
