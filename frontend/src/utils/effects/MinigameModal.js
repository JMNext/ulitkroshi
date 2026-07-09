import Phaser from 'phaser';

export function showMinigameModal(scene) {
  const { width, height } = scene.scale;

  // ИСПРАВЛЕНО: Если модалка уже открыта, повторное нажатие на кнопку плавно закрывает её
  if (scene.minigameModalInstance) {
    const modal = scene.minigameModalInstance;
    scene.minigameModalInstance = null; // Сразу зануляем ссылку, чтобы снять блок

    scene.tweens.killTweensOf(modal);
    scene.tweens.add({
      targets: modal,
      y: height + 600,
      duration: 300,
      ease: 'Power2',
      onComplete: () => modal.destroy()
    });
    return;
  }
  
  const modalContainer = scene.add.container(width / 2, height + 600).setDepth(999);
  scene.minigameModalInstance = modalContainer;

  const bg = scene.add.graphics().fillStyle(0xffffff, 1).fillRoundedRect(-360, -450, 720, 900, 50);
  bg.setDepth(1);
  modalContainer.add(bg);

  const title = scene.add.text(0, -350, 'МИНИ-ИГРЫ', {
    fontFamily: 'Arial, sans-serif', fontSize: '56px', color: '#1a3d1c', fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(2);
  modalContainer.add(title);

  const closeBtn = scene.add.text(290, -390, '✕', {
    fontFamily: 'Arial, sans-serif', fontSize: '44px', color: '#a0a0a0', fontStyle: 'bold'
  }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(100);
  modalContainer.add(closeBtn);

  closeBtn.on('pointerdown', () => {
    scene.tweens.killTweensOf(modalContainer);
    scene.tweens.add({
      targets: modalContainer,
      y: height + 600,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        scene.minigameModalInstance = null;
        modalContainer.destroy();
      }
    });
  });

  scene.tweens.add({
    targets: modalContainer,
    y: height / 2,
    duration: 500,
    ease: 'Back.easeOut',
    easeParams: [0.8]
  });

  renderMainMenu(scene, modalContainer);
}

function clearModalContent(modalContainer) {
  const children = [...modalContainer.list];
  children.forEach(child => {
    if (child.type !== 'Graphics' && child.text !== 'МИНИ-ИГРЫ' && child.text !== '✕') {
      child.destroy();
    }
  });
}

function renderMainMenu(scene, modalContainer) {
  clearModalContent(modalContainer);

  const games = [
    { text: 'НАЙДИ ПАРУ', y: -160, scene: 'MemoryGameScene' },
    { text: 'ЛОВЛЯ ФРУКТОВ', y: 10, scene: 'CatchGameScene' },
    { text: 'ЗМЕЙКА', y: 180, scene: 'SnakeGameScene' }
  ];

  games.forEach(game => {
    const btnGeom = new Phaser.Geom.Rectangle(0, 0, 540, 110);
    const btnHitbox = scene.add.zone(0, game.y, 540, 110).setInteractive(btnGeom, Phaser.Geom.Rectangle.Contains).setDepth(100);
    
    const btnGraphics = scene.add.graphics().fillStyle(0x61aa05, 1).fillRoundedRect(-270, game.y - 55, 540, 110, 55).setDepth(2);
    const txt = scene.add.text(0, game.y, game.text, {
      fontFamily: 'Arial, sans-serif', fontSize: '38px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);

    modalContainer.add([btnGraphics, txt, btnHitbox]);

    // ИСПРАВЛЕНО: Сброс зависания анимаций через принудительный killTweensOf
    btnHitbox.on('pointerdown', () => {
      scene.tweens.killTweensOf([btnGraphics, txt]);
      scene.tweens.add({ targets: [btnGraphics, txt], scaleX: 0.96, scaleY: 0.96, duration: 50 });
    });

    btnHitbox.on('pointerout', () => {
      scene.tweens.killTweensOf([btnGraphics, txt]);
      scene.tweens.add({ targets: [btnGraphics, txt], scaleX: 1, scaleY: 1, duration: 50 });
    });

    btnHitbox.on('pointerup', () => {
      scene.tweens.killTweensOf([btnGraphics, txt]);
      scene.tweens.add({
        targets: [btnGraphics, txt],
        scaleX: 1,
        scaleY: 1,
        duration: 50,
        onComplete: () => {
          renderDifficultyMenu(scene, modalContainer, game.scene);
        }
      });
    });
  });
}

function renderDifficultyMenu(scene, modalContainer, targetScene) {
  clearModalContent(modalContainer);

  const backBtn = scene.add.text(-290, -390, '←', {
    fontFamily: 'Arial, sans-serif', fontSize: '50px', color: '#a0a0a0', fontStyle: 'bold'
  }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(100);
  modalContainer.add(backBtn);

  backBtn.on('pointerup', () => {
    renderMainMenu(scene, modalContainer);
  });

  const subTitle = scene.add.text(0, -220, 'ВЫБЕРИ СЛОЖНОСТЬ:', {
    fontFamily: 'Arial, sans-serif', fontSize: '42px', color: '#555555', fontStyle: 'bold'
  }).setOrigin(0.5).setDepth(2);
  modalContainer.add(subTitle);

  const modes = [
    { text: 'ЛЕГКО', difficulty: 'easy', y: -90, color: 0x61aa05 },
    { text: 'НОРМАЛЬНО', difficulty: 'medium', y: 60, color: 0xf9b300 },
    { text: 'СЛОЖНО', difficulty: 'hard', y: 210, color: 0xd32f2f }
  ];

  modes.forEach(mode => {
    const btnGeom = new Phaser.Geom.Rectangle(0, 0, 480, 100);
    const btnHitbox = scene.add.zone(0, mode.y, 480, 100).setInteractive(btnGeom, Phaser.Geom.Rectangle.Contains).setDepth(100);

    const btnGraphics = scene.add.graphics().fillStyle(mode.color, 1).fillRoundedRect(-240, mode.y - 50, 480, 100, 50).setDepth(2);
    const txt = scene.add.text(0, mode.y, mode.text, {
      fontFamily: 'Arial, sans-serif', fontSize: '36px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);

    modalContainer.add([btnGraphics, txt, btnHitbox]);

    // ИСПРАВЛЕНО: Сброс зависания анимаций для кнопок выбора сложности
    btnHitbox.on('pointerdown', () => {
      scene.tweens.killTweensOf([btnGraphics, txt]);
      scene.tweens.add({ targets: [btnGraphics, txt], scaleX: 0.96, scaleY: 0.96, duration: 50 });
    });

    btnHitbox.on('pointerout', () => {
      scene.tweens.killTweensOf([btnGraphics, txt]);
      scene.tweens.add({ targets: [btnGraphics, txt], scaleX: 1, scaleY: 1, duration: 50 });
    });

    btnHitbox.on('pointerup', () => {
      scene.tweens.killTweensOf([btnGraphics, txt]);
      scene.tweens.add({
        targets: [btnGraphics, txt],
        scaleX: 1,
        scaleY: 1,
        duration: 50,
        onComplete: () => {
          scene.minigameModalInstance = null;
          modalContainer.destroy();
          scene.scene.start(targetScene, { difficulty: mode.difficulty });
        }
      });
    });
  });
}
