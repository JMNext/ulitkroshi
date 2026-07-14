import Phaser from 'phaser';
import { MainScene } from './MainScene';

const DRAG_CONFIG = {
  feed: { texture: 'icon-eat', anim: 'eat', duration: 0, yOffset: -295, size: 80, radius: 230 },
  play: { texture: 'icon-play', anim: 'play', duration: 1100, yOffset: -295, size: 80, radius: 230 },
  wash: { texture: 'icon-wash', anim: 'wash', duration: 0, yOffset: -295, size: 80, radius: 230 },
};

const checkOverlapWithPet = (scene: MainScene, obj: Phaser.GameObjects.Image, overlapRadius: number): boolean => {
  if (!scene.krosh) return false;
  const isPort = window.innerWidth < window.innerHeight;
  const uiScale = isPort ? 0.7 : 1.0;
  const verticalOffset = isPort ? 295 : 322;
  return Phaser.Math.Distance.Between(obj.x, obj.y, scene.krosh.x, scene.krosh.y - (verticalOffset * uiScale)) < (overlapRadius * uiScale);
};

const createCareDrag = (scene: MainScene, nativeEvent: any, config: typeof DRAG_CONFIG.feed): void => {
  if (!scene.krosh || scene.krosh.isSleeping || scene.krosh.isTransitioning) return;
  scene.input.setDefaultCursor('default');

  const isPort = window.innerWidth < window.innerHeight;
  const uiScale = isPort ? 0.7 : 1.0;
  const adaptiveSize = config.size * uiScale;
  const isTouch = !!(nativeEvent.touches && nativeEvent.touches.length > 0);
  const clientX = isTouch ? nativeEvent.touches[0].clientX : nativeEvent.clientX;
  const clientY = isTouch ? nativeEvent.touches[0].clientY : nativeEvent.clientY;

  const cam = scene.cameras.main;
  const phaserPoint = cam.getWorldPoint(clientX, clientY);
  const item = scene.add.image(phaserPoint.x, phaserPoint.y, config.texture).setDisplaySize(adaptiveSize, adaptiveSize).setDepth(9999).setOrigin(0.5);

  scene.input.activePointer.x = phaserPoint.x;
  scene.input.activePointer.y = phaserPoint.y;
  scene.input.activePointer.isDown = true;

  const onPointerMove = (p: Phaser.Input.Pointer) => {
    if (item.active) {
      item.x = p.x;
      item.y = p.y;
    }
  };

  const onNativeTouchMove = (e: TouchEvent) => {
    if (item.active && e.touches && e.touches.length > 0) {
      const p = cam.getWorldPoint(e.touches[0].clientX, e.touches[0].clientY);
      item.x = p.x;
      item.y = p.y;
    }
  };

  const onNativeMouseMove = (e: MouseEvent) => {
    if (item.active) {
      const p = cam.getWorldPoint(e.clientX, e.clientY);
      item.x = p.x;
      item.y = p.y;
    }
  };

  const cleanupListeners = () => {
    scene.input.off('pointermove', onPointerMove);
    scene.input.off('pointerup', onPointerUp);
    window.removeEventListener('mousemove', onNativeMouseMove);
    window.removeEventListener('touchmove', onNativeTouchMove);
    window.removeEventListener('mouseup', onPointerUp);
    window.removeEventListener('touchend', onPointerUp);
  };

  const onPointerUp = () => {
    cleanupListeners();

    if (!item.active || !scene.krosh) return;

    if (checkOverlapWithPet(scene, item, config.radius)) {
      if (config.anim === 'wash') scene.playWashSequence();
      else if (config.anim === 'play') scene.playPlaySequence();
      else if (scene.krosh.playAnim) scene.krosh.playAnim(config.anim, false);

      if (config.duration === 0) {
        scene.tweens.add({ targets: item, y: item.y - 40, alpha: 0, duration: 350, ease: 'Cubic.easeOut', onComplete: () => item.active && item.destroy() });
      } else {
        const targetYOffset = isPort ? -295 : -322;
        scene.tweens.add({ targets: item, scale: 0.1, alpha: 0, x: scene.krosh.x, y: scene.krosh.y + (targetYOffset * uiScale), duration: config.duration, ease: 'Cubic.easeOut', onComplete: () => item.active && item.destroy() });
      }
    } else {
      scene.tweens.add({ targets: item, scale: 0, alpha: 0, duration: 200, onComplete: () => item.active && item.destroy() });
    }
  };

  scene.input.on('pointermove', onPointerMove);
  scene.input.on('pointerup', onPointerUp);
  window.addEventListener('mousemove', onNativeMouseMove);
  window.addEventListener('touchmove', onNativeTouchMove, { passive: true });
  window.addEventListener('mouseup', onPointerUp, { once: true });
  window.addEventListener('touchend', onPointerUp, { once: true });

  scene.events.once('shutdown', () => {
    cleanupListeners();
    if (item.active) item.destroy();
  });
};

export const startFeedingDrag = (s: MainScene, e: any) => createCareDrag(s, e, DRAG_CONFIG.feed);
export const startPlayingDrag = (s: MainScene, e: any) => createCareDrag(s, e, DRAG_CONFIG.play);
export const startWashingDrag = (s: MainScene, e: any) => createCareDrag(s, e, DRAG_CONFIG.wash);
