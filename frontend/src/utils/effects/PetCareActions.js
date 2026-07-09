import Phaser from 'phaser';

export function updateHealthBar(scene, hp) {
  if (!scene.healthBarGraphics || !scene.healthText) return;
  scene.healthBarGraphics.clear().fillStyle(0x61aa05, 1).fillRoundedRect(50, 15, 460 * (hp / 100), 48, 24);
  scene.healthText.setText(`${hp}%`);
}

function checkOverlapWithPet(scene, gameObject) {
  if (!scene.krosh?.anims?.[scene.krosh.currentAnimation]) return false;
  const petSprite = scene.krosh.anims[scene.krosh.currentAnimation];
  return petSprite.active && Phaser.Geom.Intersects.RectangleToRectangle(petSprite.getBounds(), gameObject.getBounds());
}

function createCareDrag(scene, startX, startY, texture, animKey, hpBonus, duration, yOffset, size) {
  scene.input.setDefaultCursor('default');
  const item = scene.add.image(startX, startY, texture).setDisplaySize(size, size).setDepth(9999).setOrigin(0.5);

  item.setInteractive({ draggable: true });
  scene.input.setDraggable(item);

  item.x = scene.input.activePointer.x;
  item.y = scene.input.activePointer.y;

  item.on('drag', pointer => { item.x = pointer.x; item.y = pointer.y; });
  item.on('dragend', () => {
    const isSuccess = checkOverlapWithPet(scene, item);
    if (isSuccess && scene.krosh?.playAnim) scene.krosh.playAnim(animKey, false);

    scene.tweens.add({
      targets: item,
      scale: isSuccess ? 0.1 : 1,
      alpha: isSuccess ? 0 : 1,
      x: isSuccess ? scene.krosh.x_coord : startX,
      y: isSuccess ? scene.krosh.y_coord + yOffset : startY,
      duration: isSuccess ? duration : 300,
      ease: isSuccess ? 'Cubic.easeOut' : 'Back.easeOut',
      onComplete: () => {
        item.destroy();
        if (isSuccess && hpBonus > 0) {
          const nextHp = Math.min((scene.registry.get('hp') || 100) + hpBonus, 100);
          scene.registry.set('hp', nextHp);
          updateHealthBar(scene, nextHp);
        }
      }
    });
  });
}

export function startFeedingDrag(scene, startX, startY) {
  createCareDrag(scene, startX, startY, 'icon-coin', 'eat', 10, 1500, 40, 130);
}

export function startPlayingDrag(scene, startX, startY) {
  createCareDrag(scene, startX, startY, 'item-ball', 'play', 15, 1650, 80, 130);
}

export function startWashingDrag(scene, startX, startY) {
  createCareDrag(scene, startX, startY, 'icon-dush', 'wash', 0, 1500, -240, 130);
}
