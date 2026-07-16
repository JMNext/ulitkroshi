import Phaser from 'phaser';
import { usePetCareStore } from '../../usePetCareStore';

export interface BaseDragConfig {
  url: string;
  onSuccess: (endX: number, endY: number) => void;
}

const checkOverlapWithPetCSS = (clientX: number, clientY: number): boolean => {
  const targetX = window.innerWidth / 2 - 40;
  const targetY = window.innerHeight * 0.55;
  return Phaser.Math.Distance.Between(clientX, clientY, targetX, targetY) <= 160;
};

export const createBaseDrag = (scene: Phaser.Scene, nativeEvent: any, config: BaseDragConfig): void => {
  const state = usePetCareStore.getState().currentAnim;
  if (state !== 'prostoi1' && state !== 'prostoi2') return;

  const touch = nativeEvent.touches?.[0] || nativeEvent.changedTouches?.[0] || nativeEvent;
  if (!touch || typeof touch.clientX !== 'number') return;

  const snd = scene.sound as any;
  if (snd?.context?.state === 'suspended') snd.context.resume();

  const dragImg = document.createElement('img');
  dragImg.src = config.url;
  dragImg.style.cssText = `
    position: fixed;
    left: ${touch.clientX}px;
    top: ${touch.clientY}px;
    width: 80px;
    height: 80px;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 50;
  `;
  document.getElementById('game-container')?.appendChild(dragImg);

  const onGlobalMove = (e: any) => {
    const m = e.touches?.[0] || e.changedTouches?.[0] || e;
    if (!m || typeof m.clientX !== 'number') return;
    dragImg.style.left = `${m.clientX}px`;
    dragImg.style.top = `${m.clientY}px`;
  };

  const onGlobalUp = (e: any) => {
    cleanup();
    const m = e.touches?.[0] || e.changedTouches?.[0] || e;
    const endX = m?.clientX ?? touch.clientX;
    const endY = m?.clientY ?? touch.clientY;

    if (checkOverlapWithPetCSS(endX, endY)) {
      dragImg.remove();
      config.onSuccess(endX, endY);
    } else {
      dragImg.style.transition = 'all 200ms ease-out';
      dragImg.style.opacity = '0';
      dragImg.style.transform = 'translate(-50%, -50%) scale(0)';
      setTimeout(() => dragImg.remove(), 200);
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

  scene.events.once('shutdown', () => { cleanup(); dragImg.remove(); });
};
