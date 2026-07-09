import Phaser from 'phaser';

export function createGameBackground(scene) {
  const { width, height } = scene.scale;
  scene.add.image(width / 2, height / 2, 'bg-jungli').setDisplaySize(width, height).setDepth(0);

  const petVideo = scene.add.video(180, height - 180);
  petVideo.loadURL('/assets/resources/anim/hello.webm', 'loadeddata', false);
  
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

export function buildCardsGrid(scene, deck, config) {
  const { width, height } = scene.scale;
  const cards = [];
  const cardW = 180, cardH = 180, spacingX = 40, spacingY = 40;

  const gridW = config.cols * cardW + (config.cols - 1) * spacingX;
  const gridH = config.rows * cardH + (config.rows - 1) * spacingY;

  const startX = (width - gridW) / 2 + cardW / 2;
  const startY = (height - gridH) / 2 + cardH / 2;

  let cardIndex = 0;

  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.cols; c++) {
      const posX = startX + c * (cardW + spacingX);
      const posY = startY + r * (cardH + spacingY);
      
      const rawId = deck[cardIndex];
      const textureKey = `fruit-${rawId}`;

      const container = scene.add.container(posX, posY).setDepth(5);
      const bg = scene.add.graphics();
      bg.fillStyle(0xffffff, 1).fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 30);
      bg.lineStyle(6, 0xf2eee6, 1).strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 30);

      const fruitImg = scene.add.image(0, 0, textureKey).setDisplaySize(140, 140).setAlpha(0);
      const shirtImg = scene.add.image(0, 0, 'card-back').setDisplaySize(130, 130).setAlpha(1);

      container.add([bg, fruitImg, shirtImg]);
      
      container.fruitKey = rawId; 
      container.fruitImg = fruitImg;
      container.shirtImg = shirtImg;
      container.isFaceUp = false;

      container.setInteractive(new Phaser.Geom.Rectangle(-cardW / 2, -cardH / 2, cardW, cardH), Phaser.Geom.Rectangle.Contains);
      container.on('pointerdown', () => scene.handleCardClick(container));

      cards.push(container);
      cardIndex++;
    }
  }
  return cards;
}

export function animateFlip(scene, card, showFruit, onComplete) {
  scene.tweens.add({
    targets: card, scaleX: 0, duration: 150, yoyo: true,
    onYoyo: () => {
      if (showFruit) {
        card.shirtImg.setAlpha(0);
        card.fruitImg.setAlpha(1);
        card.isFaceUp = true;
      } else {
        card.shirtImg.setAlpha(1);
        card.fruitImg.setAlpha(0);
        card.isFaceUp = false;
      }
    },
    onComplete: onComplete
  });
}

export function animateMatchSuccess(scene, card1, card2, onComplete) {
  scene.tweens.add({
    targets: [card1, card2],
    scaleX: 0,
    scaleY: 0,
    alpha: 0,
    duration: 300,
    ease: 'Back.easeIn',
    onComplete: () => {
      card1.destroy();
      card2.destroy();
      if (onComplete) onComplete();
    }
  });
}

export function animateCoinExplosion(scene, amount) {
  const { width, height } = scene.scale;
  for (let i = 0; i < amount; i++) {
    scene.time.delayedCall(i * 30, () => {
      const coin = scene.add.graphics().fillStyle(0xf9b300, 1).fillCircle(0, 0, 25).setDepth(30);
      coin.lineStyle(4, 0xffffff, 0.5).strokeCircle(0, 0, 25);
      coin.x = width / 2 + Phaser.Math.Between(-100, 100);
      coin.y = height / 2 + Phaser.Math.Between(50, 200);

      scene.tweens.add({
        targets: coin,
        x: coin.x + Phaser.Math.Between(-300, 300),
        y: coin.y - Phaser.Math.Between(400, 800),
        scale: 1.5,
        duration: 600,
        ease: 'Quad.easeOut',
        yoyo: false,
        onComplete: () => {
          scene.tweens.add({
            targets: coin,
            y: height + 100,
            alpha: 0,
            scale: 0.5,
            duration: 500,
            ease: 'Quad.easeIn',
            onComplete: () => coin.destroy()
          });
        }
      });
    });
  }
}

export function showWinModal(scene) {
  const { width, height } = scene.scale;
  const winContainer = scene.add.container(width / 2, height / 2).setDepth(20);

  const winBg = scene.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(-350, -250, 700, 500, 60);
  winBg.lineStyle(8, 0x61aa05, 1).strokeRoundedRect(-350, -250, 700, 500, 60);

  const txt = scene.add.text(0, -80, 'ПОБЕДА!', {
    fontFamily: 'Arial, sans-serif', fontSize: '72px', color: '#1a3d1c', fontStyle: 'bold'
  }).setOrigin(0.5);

  const scoreTxt = scene.add.text(0, 20, '+20 МОНЕТ', {
    fontFamily: 'Arial, sans-serif', fontSize: '46px', color: '#4c9203', fontStyle: 'bold'
  }).setOrigin(0.5);

  const btn = scene.add.graphics().fillStyle(0x61aa05, 1).fillRoundedRect(-200, 100, 400, 100, 50);
  const btnTxt = scene.add.text(0, 150, 'ОК', {
    fontFamily: 'Arial, sans-serif', fontSize: '44px', color: '#ffffff', fontStyle: 'bold'
  }).setOrigin(0.5);

  winContainer.add([winBg, txt, scoreTxt, btn, btnTxt]);

  btnTxt.setInteractive(new Phaser.Geom.Rectangle(-200, -50, 400, 100), Phaser.Geom.Rectangle.Contains)
    .on('pointerdown', () => {
      if (scene.petGamerVideo) {
        scene.petGamerVideo.stop();
        scene.petGamerVideo.destroy();
      }
      scene.scene.start('GameScene');
    });
}
