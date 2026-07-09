import Phaser, { Scene } from 'phaser';
import { AnimatedCharacter } from '../entities/AnimatedCharacter';
import {
  createBottomMenu,
  createGameHeader,
  createSideButtons,
} from '../../utils/effects/GameSceneEffects';

export class GameScene extends Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('bg-jungle', '/assets/background/background_jungli.png');
    this.load.image('bg-bottom-menu', '/assets/background/buttom-menu.svg'); 

    this.load.image('icon-coin', '/assets/interface-icons/eat_top-left.svg'); 
    this.load.image('icon-avatar', '/assets/interface-icons/button_ava.svg'); 
    this.load.image('icon-life', '/assets/interface-icons/life.svg');       
    this.load.image('icon-plus', '/assets/interface-icons/button_plus.svg'); 

    this.load.image('icon-shop', '/assets/interface-icons/shop.svg');       
    this.load.image('icon-foto', '/assets/interface-icons/foto.svg');       
    this.load.image('icon-minigame', '/assets/interface-icons/mini_games.svg'); 
    this.load.image('icon-mypets', '/assets/interface-icons/my_pets.svg');   

    this.load.image('icon-eat', '/assets/interface-icons/eat.svg');         
    this.load.image('icon-wash', '/assets/interface-icons/wash.svg');       
    this.load.image('icon-play', '/assets/interface-icons/play.svg');       
    this.load.image('icon-sleep', '/assets/interface-icons/sleep.svg');     

    this.load.image('item-ball', '/assets/interface-icons/boll.svg'); 
    this.load.image('icon-dush', '/assets/interface-icons/dush.svg');

    this.load.video('idle', '/assets/resources/anim/prostoi-converted.webm', 'loadeddata', false, true);
    this.load.video('eat', '/assets/resources/anim/eat-converted.webm', 'loadeddata', false, true);
    this.load.video('wash', '/assets/resources/anim/wash-converted.webm', 'loadeddata', false, true);
    this.load.video('play', '/assets/resources/anim/play-converted.webm', 'loadeddata', false, true);
    this.load.video('sleep', '/assets/resources/anim/sleep-converted.webm', 'loadeddata', false, true);
  }

  create() {
    console.log('GameScene: Сборка интерфейса меню Тамагочи');

    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    this.cameras.main.fadeIn(500, 0, 0, 0);

    const bg = this.add.image(centerX, centerY, 'bg-jungle');
    bg.setDisplaySize(width, height).setDepth(0);

    // 1. Сначала собираем статический тяжелый интерфейс (плашки, текст, графику бархана)
    createGameHeader(this);
    createSideButtons(this);
    createBottomMenu(this);

    // 2. ИСПРАВЛЕНО: Создаем персонажа строго ПОСЛЕ сборки интерфейса.
    // WebGL контекст уже свободен, и видеоролики инициализируются бесшовно без микро-фризов.
    this.krosh = new AnimatedCharacter(this, centerX, centerY + 24, 'idle');

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (this.krosh.isSleeping) return; 
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.events.on('shutdown', this.handleShutdown, this);
  }

  handleShutdown() {
    if (this.krosh) {
      this.krosh.destroy();
    }
  }
}
