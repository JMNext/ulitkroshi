import Phaser from 'phaser';

export function createSnakeBackground(scene) {
  const { width, height } = scene.scale;
  scene.add.image(width / 2, height / 2, 'bg-jungli').setDisplaySize(width, height).setDepth(0);

  // Дублируем приземление на землю для экрана Змейки
  const petVideo = scene.add.video(180, height - 180);
  petVideo.loadURL('/assets/resources/anim/hello.webm', 'loadeddata', false);
  
  // ТВОЙ СЕКРЕТНЫЙ РАЗМЕР: 80 НА 80
  petVideo.setDepth(3).setDisplaySize(80, 80).setMute(true).setAlpha(0);

  petVideo.on('locked', () => petVideo.play(true));
  petVideo.on('play', () => {
    scene.tweens.add({ targets: petVideo, alpha: 1, duration: 300 });
  });
  petVideo.play(true);

  scene.petGamerVideo = petVideo;

  const backBtn = scene.add.text(60, 60, '← НАЗАД', {
    fontFamily: 'Arial, sans-serif', fontSize: '44px', color: '#ffffff', fontStyle: 'bold'
  }).setInteractive().setDepth(10);
  
  backBtn.on('pointerdown', () => {
    if (scene.petGamerVideo) {
      scene.petGamerVideo.stop();
      scene.petGamerVideo.destroy();
    }
    scene.scene.start('GameScene');
  });
}

export function drawPlayGrid(scene, minX, maxX, minY, maxY, size) {
  const gridGraphics = scene.add.graphics().setDepth(2);
  
  const startX = minX * size;
  const startY = minY * size;
  const gridWidth = (maxX - minX + 1) * size;
  const gridHeight = (maxY - minY + 1) * size;

  gridGraphics.fillStyle(0xffffff, 0.4);
  gridGraphics.fillRoundedRect(startX, startY, gridWidth, gridHeight, 24);

  gridGraphics.lineStyle(2, 0x000000, 0.2);

  for (let x = minX + 1; x <= maxX; x++) {
    gridGraphics.moveTo(x * size, startY);
    gridGraphics.lineTo(x * size, startY + gridHeight);
  }

  for (let y = minY + 1; y <= maxY; y++) {
    gridGraphics.moveTo(startX, y * size);
    gridGraphics.lineTo(startX + gridWidth, y * size);
  }
  gridGraphics.strokePath();

  gridGraphics.lineStyle(6, 0x61aa05, 1);
  gridGraphics.strokeRoundedRect(startX, startY, gridWidth, gridHeight, 24);
}

export function createSnakeHeader(scene) {
  const { width } = scene.scale;
  scene.scoreText = scene.add.text(width / 2, 180, 'СЧЕТ: 0', {
    fontFamily: 'Arial, sans-serif', fontSize: '72px', color: '#1a3d1c', fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(10);
}

export function createMobileControls(scene) {
  const { width, height } = scene.scale;
  const cx = width / 2;
  const cy = height - 230;
  const r = 85;

  const addArrow = (x, y, label, dir) => {
    const container = scene.add.container(x, y).setDepth(10);
    const bg = scene.add.graphics().fillStyle(0xffffff, 0.9).fillCircle(0, 0, r);
    bg.lineStyle(4, 0xf2eee6, 1).strokeCircle(0, 0, r);
    const text = scene.add.text(0, 0, label, {
      fontFamily: 'Arial, sans-serif', fontSize: '64px', color: '#424242', fontStyle: 'bold'
    }).setOrigin(0.5);
    
    container.add([bg, text]);
    container.setInteractive(new Phaser.Geom.Circle(0, 0, r), Phaser.Geom.Circle.Contains)
      .on('pointerdown', () => {
        container.setScale(0.9);
        scene.changeDirection(dir);
      })
      .on('pointerup', () => container.setScale(1))
      .on('pointerout', () => container.setScale(1));
  };

  addArrow(cx, cy - 120, '▲', 'UP');
  addArrow(cx, cy + 120, '▼', 'DOWN');
  addArrow(cx - 150, cy, '◀', 'LEFT');
  addArrow(cx + 150, cy, '▶', 'RIGHT');
}

export function showSnakeGameOver(scene, finalScore) {
  const { width, height } = scene.scale;
  const modal = scene.add.container(width / 2, height / 2).setDepth(20);

  const bg = scene.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(-350, -250, 700, 500, 60);
  bg.lineStyle(8, 0xd32f2f, 1).strokeRoundedRect(-350, -250, 700, 500, 60);

  const title = scene.add.text(0, -90, 'ИГРА ОКОНЧЕНА', {
    fontFamily: 'Arial, sans-serif', fontSize: '60px', color: '#d32f2f', fontStyle: 'bold'
  }).setOrigin(0.5);

  const scoreTxt = scene.add.text(0, 10, `СЪЕДЕНО: ${finalScore}`, {
    fontFamily: 'Arial, sans-serif', fontSize: '44px', color: '#4a4a4a', fontStyle: 'bold'
  }).setOrigin(0.5);

  const btn = scene.add.graphics().fillStyle(0x61aa05, 1).fillRoundedRect(-200, 100, 400, 100, 50);
  const btnTxt = scene.add.text(0, 150, 'В МЕНЮ', {
    fontFamily: 'Arial, sans-serif', fontSize: '44px', color: '#ffffff', fontStyle: 'bold'
  }).setOrigin(0.5);

  modal.add([bg, title, scoreTxt, btn, btnTxt]);
  btnTxt.setInteractive(new Phaser.Geom.Rectangle(-200, -50, 400, 100), Phaser.Geom.Rectangle.Contains)
    .on('pointerdown', () => {
      if (scene.petGamerVideo) {
        scene.petGamerVideo.stop();
        scene.petGamerVideo.destroy();
      }
      scene.scene.start('GameScene');
    });
}
