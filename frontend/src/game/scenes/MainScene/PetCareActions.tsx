import Phaser from 'phaser';
import { ActionPetCharacter } from './animations/ActionPetCharacter';
import { BasePetCharacter } from './animations/BasePetCharacter';
import { MainPetPosition } from './MainPetPosition';

import eatIconUrl from '../../../assets/buttom_menu-icons/eat.svg';
import playIconUrl from '../../../assets/buttom_menu-icons/play.svg';
import washIconUrl from '../../../assets/buttom_menu-icons/wash.svg';

interface DragItemConfig {
  texture: string;
  url: string;
  anim: string;
  duration: number;
  radius: number;
}

const DRAG_CONFIG: Record<string, DragItemConfig> = {
  feed: { texture: 'icon-eat', url: eatIconUrl, anim: 'eat', duration: 0, radius: 180 },
  play: { texture: 'icon-play', url: playIconUrl, anim: 'play', duration: 1100, radius: 180 },
  wash: { texture: 'icon-wash', url: washIconUrl, anim: 'wash', duration: 4000, radius: 180 },
};

const LOADING_TEXTURES: Record<string, boolean> = {};

const checkOverlapWithPet = (pet: BasePetCharacter, obj: Phaser.GameObjects.Image, maxDistance: number): boolean => {
  if (!pet?.video?.active) return false;
  const bounds = pet.video.getBounds();
  if (!bounds || bounds.width === 0 || bounds.height === 0) return false;
  return Phaser.Math.Distance.Between(obj.x, obj.y, bounds.centerX, bounds.centerY) <= maxDistance;
};

const getCanvasRelativeCoords = (scene: Phaser.Scene, clientX: number, clientY: number): { x: number; y: number } => {
  const canvas = scene.sys.game.canvas;
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
};

const createCareDrag = (scene: Phaser.Scene, pet: BasePetCharacter, actionChar: ActionPetCharacter, nativeEvent: any, config: DragItemConfig): void => {
  const mainScene = scene as any;
  const washChar = mainScene.washCharacter;

  if (!pet || pet.isSleeping || actionChar?.currentAnim || washChar?.isActiveAnim || !scene?.sys?.isActive()) return;

  const touch = nativeEvent.touches?.[0] || nativeEvent.changedTouches?.[0] || nativeEvent;
  if (!touch || typeof touch.clientX !== 'number') return;

  const snd = scene.sound as any;
  if (snd && snd.context && snd.context.state === 'suspended') {
    snd.context.resume();
  }

  if (pet && typeof pet.resetIdleTimer === 'function') pet.resetIdleTimer();

  const t = MainPetPosition.getInstance().getTransform();
  const currentScale = t?.uiScale ?? 1.0;
  const startCoords = getCanvasRelativeCoords(scene, touch.clientX, touch.clientY);

  const initItemImage = () => {
    if (!scene?.sys?.isActive() || !pet?.video?.active) return;

    const baseItemSize = 110 * currentScale;
    const dynamicRadius = config.radius * currentScale;

    const item = scene.add.image(startCoords.x, startCoords.y, config.texture).setDisplaySize(baseItemSize, baseItemSize).setDepth(9999).setOrigin(0.5);

    const onGlobalMove = (e: any) => {
      if (!item?.scene || !item.active || !scene?.sys?.isActive()) return;
      const m = e.touches?.[0] || e.changedTouches?.[0] || e;
      if (!m || typeof m.clientX !== 'number') return;
      const coords = getCanvasRelativeCoords(scene, m.clientX, m.clientY);
      item.x = coords.x;
      item.y = coords.y;
    };

    const onGlobalUp = () => {
      cleanup();
      if (!item?.scene || !item.active || !scene?.sys?.isActive() || !pet?.video?.active) {
        if (item?.active) item.destroy();
        return;
      }

      if (checkOverlapWithPet(pet, item, dynamicRadius)) {
        if (config.anim === 'wash') {
          scene.events.emit('care_trigger_wash');
        } else if (config.anim === 'play') {
          scene.events.emit('care_trigger_play');
        } else {
          actionChar?.play(config.anim);
        }

        if (config.duration === 0) {
          scene.tweens.add({
            targets: item,
            y: item.y - 60 * currentScale,
            alpha: 0,
            duration: 350,
            ease: 'Cubic.easeOut',
            onComplete: () => { if (item?.active) item.destroy(); }
          });
        } else {
          scene.tweens.add({
            targets: item,
            scale: 0.05,
            alpha: 0,
            x: pet.video.x,
            y: pet.video.y - 120 * currentScale,
            duration: config.duration,
            ease: 'Cubic.easeOut',
            onComplete: () => { if (item?.active) item.destroy(); }
          });
        }
      } else {
        scene.tweens.add({
          targets: item,
          scale: 0,
          alpha: 0,
          duration: 200,
          onComplete: () => { if (item?.active) item.destroy(); }
        });
      }
    };

    const cleanup = () => {
      window.removeEventListener('mousemove', onGlobalMove);
      window.removeEventListener('mouseup', onGlobalUp);
      window.removeEventListener('touchmove', onGlobalMove);
      window.removeEventListener('touchend', onGlobalUp);
      window.removeEventListener('touchcancel', onGlobalUp);
    };

    window.addEventListener('mousemove', onGlobalMove, { passive: true });
    window.addEventListener('mouseup', onGlobalUp, { passive: true });
    window.addEventListener('touchmove', onGlobalMove, { passive: true });
    window.addEventListener('touchend', onGlobalUp, { passive: true });
    window.addEventListener('touchcancel', onGlobalUp, { passive: true });

    scene.events.once('shutdown', () => {
      cleanup();
      if (item?.active) item.destroy();
    });
  };

  if (scene.textures.exists(config.texture)) {
    initItemImage();
    return;
  }

  if (LOADING_TEXTURES[config.texture]) return;
  LOADING_TEXTURES[config.texture] = true;

  const img = new Image();
  img.src = config.url;
  img.onload = () => {
    LOADING_TEXTURES[config.texture] = false;
    if (scene?.textures && scene.sys?.isActive()) {
      if (!scene.textures.exists(config.texture)) scene.textures.addImage(config.texture, img);
      initItemImage();
    }
  };
  img.onerror = () => { LOADING_TEXTURES[config.texture] = false; };
};

export const startFeedingDrag = (scene: Phaser.Scene, pet: BasePetCharacter, actionChar: ActionPetCharacter, e: TouchEvent | MouseEvent) => createCareDrag(scene, pet, actionChar, e, DRAG_CONFIG.feed);
export const startPlayingDrag = (scene: Phaser.Scene, pet: BasePetCharacter, actionChar: ActionPetCharacter, e: TouchEvent | MouseEvent) => createCareDrag(scene, pet, actionChar, e, DRAG_CONFIG.play);
export const startVendorDrag = startPlayingDrag;
export const startWashingDrag = (scene: Phaser.Scene, pet: BasePetCharacter, actionChar: ActionPetCharacter, e: TouchEvent | MouseEvent) => createCareDrag(scene, pet, actionChar, e, DRAG_CONFIG.wash);
