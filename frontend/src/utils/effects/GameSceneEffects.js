import Phaser from 'phaser';
import { showMinigameModal } from './MinigameModal';
import { startFeedingDrag, startWashingDrag, startPlayingDrag } from './PetCareActions';

export function createGameHeader(scene) {
  const { width } = scene.scale;
  const centerX = width / 2;

  const currentCoins = scene.registry.get('coins') || 0;
  const currentHp = scene.registry.get('hp') || 100;

  const coinContainer = scene.add.container(60, 40).setDepth(10);
  const coinBg = scene.add.graphics();
  
  coinBg.clear();
  coinBg.lineStyle(0);
  coinBg.fillStyle(0xffffff, 1).fillRoundedRect(0, 0, 360, 110, 55);
  coinContainer.add(coinBg);

  coinContainer.add(scene.add.image(65, 55, 'icon-coin').setDisplaySize(80, 80));

  const coinText = scene.add.text(160, 55, String(currentCoins), {
    fontFamily: 'Arial, sans-serif', fontSize: '46px', color: '#000000', fontStyle: 'bold'
  }).setOrigin(0, 0.5);
  coinContainer.add(coinText);

  const plusBtn = scene.add.image(295, 55, 'icon-plus').setDisplaySize(76, 76);
  coinContainer.add(plusBtn);

  plusBtn.setInteractive(new Phaser.Geom.Circle(38, 38, 38), Phaser.Geom.Circle.Contains)
    .on('pointerup', () => {
      console.log('Покупка монет');
    });

  const avatarBtn = scene.add.image(width - 110, 95, 'icon-avatar').setDisplaySize(130, 130).setDepth(10);
  avatarBtn.setInteractive(new Phaser.Geom.Circle(65, 65, 65), Phaser.Geom.Circle.Contains);

  scene.add.text(centerX, 230, 'Булька', {
    fontFamily: 'Arial, sans-serif', fontSize: '76px', color: '#1a3d1c', fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(10);

  const healthContainer = scene.add.container(centerX - 260, 310).setDepth(10);
  
  const healthBgGraphics = scene.add.graphics();
  healthBgGraphics.clear();
  healthBgGraphics.lineStyle(0);
  healthBgGraphics.fillStyle(0xededed, 1).fillRoundedRect(50, 15, 460, 48, 24);
  healthContainer.add(healthBgGraphics);
  
  scene.healthBarGraphics = scene.add.graphics();
  scene.healthBarGraphics.clear();
  scene.healthBarGraphics.lineStyle(0);
  scene.healthBarGraphics.fillStyle(0x61aa05, 1);
  scene.healthBarGraphics.fillRoundedRect(50, 15, 460 * (currentHp / 100), 48, 24);
  healthContainer.add(scene.healthBarGraphics);
  
  healthContainer.add(scene.add.image(30, 38, 'icon-life').setDisplaySize(90, 90));

  scene.healthText = scene.add.text(centerX, 435, `${currentHp}%`, {
    fontFamily: 'Arial, sans-serif', fontSize: '56px', color: '#1a3d1c', fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(10);
}

export function createSideButtons(scene) {
  const { width } = scene.scale;

  const makeBtn = (x, y, iconKey, callback) => {
    const img = scene.add.image(x, y, iconKey).setDisplaySize(150, 150).setDepth(10);

    img.setInteractive(new Phaser.Geom.Circle(75, 75, 75), Phaser.Geom.Circle.Contains)
      .on('pointerup', () => {
        if (callback) callback();
      });
  };

  makeBtn(140, 580, 'icon-shop', () => console.log('Магазин'));
  makeBtn(140, 780, 'icon-foto', () => console.log('Фотоаппарат'));
  makeBtn(width - 140, 580, 'icon-minigame', () => showMinigameModal(scene));
  makeBtn(width - 140, 780, 'icon-mypets', () => console.log('Мои питомцы'));
}

export function createBottomMenu(scene) {
  const { width, height } = scene.scale;
  const centerX = width / 2;

  const menuHeight = 436;               
  const menuTopY = height - menuHeight; 

  const bottomMenuBg = scene.add.image(centerX, menuTopY, 'bg-bottom-menu').setDepth(5);
  bottomMenuBg.setOrigin(0.5, 0); 
  bottomMenuBg.setDisplaySize(width, menuHeight); 

  // ТОЧНЫЙ ГЕОМЕТРИЧЕСКИЙ РАСЧЕТ ИНТЕРФЕЙСА:
  const textFontSize = 36;
  // 1. Координата Y макушки текста (Отнимаем 44px отступа от низа и высоту самого шрифта)
  const textGlobalY = height - 44 - textFontSize; 
  const iconSize = 180;
  // 2. Центр иконки находится выше макушки текста на 34px и на половину своего размера (90px)
  const buttonsGlobalY = textGlobalY - 34 - (iconSize / 2); 

  const items = [
    { text: 'Кормить', icon: 'icon-eat', action: (x, y) => startFeedingDrag(scene, x, y) },
    { text: 'Мыть', icon: 'icon-wash', action: (x, y) => startWashingDrag(scene, x, y) },
    { text: 'Играть', icon: 'icon-play', action: (x, y) => startPlayingDrag(scene, x, y) }, 
    { text: 'Спать', icon: 'icon-sleep', action: () => { if (scene.krosh) scene.krosh.playAnim('sleep', true); } } 
  ];

  const totalButtons = items.length;

  items.forEach((item, index) => {
    const buttonX = (width / (totalButtons + 1)) * (index + 1);
    
    const btnContainer = scene.add.container(buttonX, 0).setDepth(10);
    
    const iconImg = scene.add.image(0, buttonsGlobalY, item.icon).setDisplaySize(iconSize, iconSize);
    
    // ИСПРАВЛЕНО: Привязали текст за его ВЕРХНИЙ край (0.5, 0). 
    // Теперь расстояние 34 пикселя до иконки считается идеально ровно без прижимания букв к картинке
    const label = scene.add.text(0, textGlobalY, item.text, {
      fontFamily: 'Arial, sans-serif', 
      fontSize: `${textFontSize}px`, 
      color: '#424242', 
      fontStyle: 'bold'
    }).setOrigin(0.5, 0); 

    btnContainer.add([iconImg, label]);

    // Адаптировали хитбокс прямоугольника под новые честные границы контейнера
    btnContainer.setInteractive(
      new Phaser.Geom.Rectangle(-90, buttonsGlobalY - 90, 180, 280), 
      Phaser.Geom.Rectangle.Contains
    )
      .on('pointerup', () => {
        if (item.action) {
          item.action(buttonX, buttonsGlobalY);
        }
      });
  });
}
