import Phaser from 'phaser';

export function createCatchBackground(scene) {
  const { width, height } = scene.scale;
  scene.add.image(width / 2, height / 2, 'bg-jungli').setDisplaySize(width, height).setDepth(0);

  const backBtn = scene.add.text(60, 60, '← НАЗАД', {
    fontFamily: 'Arial, sans-serif', fontSize: '44px', color: '#ffffff', fontStyle: 'bold'
  }).setInteractive().setDepth(10);
  
  backBtn.on('pointerdown', () => scene.scene.start('GameScene'));
}

export function createCatchHeader(scene) {
  const { width } = scene.scale;
  const centerX = width / 2;

  scene.scoreText = scene.add.text(centerX, 200, 'СЧЕТ: 0', {
    fontFamily: 'Arial, sans-serif', fontSize: '72px', color: '#1a3d1c', fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(10);

  const healthContainer = scene.add.container(centerX - 260, 290).setDepth(10);
  const healthTrack = scene.add.graphics().fillStyle(0xededed, 1).fillRoundedRect(50, 15, 460, 48, 24);
  healthContainer.add(healthTrack);

  scene.healthBarGraphics = scene.add.graphics();
  healthContainer.add(scene.healthBarGraphics);

  const heart = scene.add.image(30, 38, 'icon-life').setDisplaySize(90, 90);
  healthContainer.add(heart);

  scene.healthPctText = scene.add.text(centerX, 415, '100%', {
    fontFamily: 'Arial, sans-serif', fontSize: '56px', color: '#1a3d1c', fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(10);

  updateCatchHealthBar(scene, 100);
}

export function updateCatchHealthBar(scene, hp) {
  if (!scene.healthBarGraphics) return;
  scene.healthBarGraphics.clear().fillStyle(0x61aa05, 1);
  if (hp > 0) scene.healthBarGraphics.fillRoundedRect(50, 15, 460 * (hp / 100), 48, 24);
  if (scene.healthPctText) scene.healthPctText.setText(`${hp}%`);
}

export function createPlayer(scene) {
  const { width, height } = scene.scale;
  const player = scene.add.image(width / 2, height - 380, 'player-begemot');
  player.setDepth(5).setDisplaySize(280, 280);
  return player;
}

export function createCatchControls(scene) {
  const { width, height } = scene.scale;
  const btnY = height - 160;
  const r = 90;

  // Активируем режим фиксации клика только на верхнем объекте
  scene.input.setTopOnly(true);

  const makeArrow = (x, label, moveDir) => {
    const container = scene.add.container(x, btnY).setDepth(10);
    const bg = scene.add.graphics().fillStyle(0xffffff, 0.9).fillCircle(0, 0, r);
    bg.lineStyle(4, 0xf2eee6, 1).strokeCircle(0, 0, r);
    const txt = scene.add.text(0, 0, label, {
      fontFamily: 'Arial, sans-serif', fontSize: '72px', color: '#424242', fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, txt]);
    container.setInteractive(new Phaser.Geom.Circle(0, 0, r), Phaser.Geom.Circle.Contains)
      .on('pointerdown', () => {
        container.setScale(0.9);
        scene.moveDirection = moveDir;
      })
      .on('pointerup', () => {
        container.setScale(1);
        if (scene.moveDirection === moveDir) scene.moveDirection = 0;
      })
      .on('pointerout', () => {
        container.setScale(1);
        if (scene.moveDirection === moveDir) scene.moveDirection = 0;
      });
  };

  makeArrow(180, '◀', -1);
  makeArrow(width - 180, '▶', 1);
}

export function showGameOverModal(scene, finalScore) {
  const { width, height } = scene.scale;
  const modal = scene.add.container(width / 2, height / 2).setDepth(20);
  const bg = scene.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(-350, -250, 700, 500, 60);
  bg.lineStyle(8, 0xd32f2f, 1).strokeRoundedRect(-350, -250, 700, 500, 60);

  const title = scene.add.text(0, -90, 'ИГРА ОКОНЧЕНА', {
    fontFamily: 'Arial, sans-serif', fontSize: '60px', color: '#d32f2f', fontStyle: 'bold'
  }).setOrigin(0.5);

  const scoreTxt = scene.add.text(0, 10, `ПОЙМАНО: ${finalScore}`, {
    fontFamily: 'Arial, sans-serif', fontSize: '44px', color: '#4a4a4a', fontStyle: 'bold'
  }).setOrigin(0.5);

  const btn = scene.add.graphics().fillStyle(0x61aa05, 1).fillRoundedRect(-200, 100, 400, 100, 50);
  const btnTxt = scene.add.text(0, 150, 'В МЕНЮ', {
    fontFamily: 'Arial, sans-serif', fontSize: '44px', color: '#ffffff', fontStyle: 'bold'
  }).setOrigin(0.5);

  modal.add([bg, title, scoreTxt, btn, btnTxt]);
  btnTxt.setInteractive(new Phaser.Geom.Rectangle(-200, -50, 400, 100), Phaser.Geom.Rectangle.Contains)
    .on('pointerdown', () => scene.scene.start('GameScene'));
}
