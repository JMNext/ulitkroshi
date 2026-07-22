import Phaser from 'phaser';
import { usePetCareStore } from '../../usePetCareStore';

export interface BaseDragConfig {
  url: string;
  action: 'wash' | 'play' | 'eat';
  delaySound?: boolean;
  onSuccess: (startX: number, startY: number) => void;
}

const checkOverlapWithPetCSS = (clientX: number, clientY: number): boolean => {
  const petElement = document.querySelector('.pet-anim-prostoi1') || document.querySelector('.pet-anim-prostoi2');
  if (petElement) {
    const rect = petElement.getBoundingClientRect();
    const petCenterX = window.innerWidth / 2;
    const petCenterY = rect.top + rect.height / 2;
    const maxDistance = Math.max(rect.width, rect.height) * 0.4;
    return Phaser.Math.Distance.Between(clientX, clientY, petCenterX, petCenterY) <= maxDistance;
  }
  const targetX = window.innerWidth / 2;
  const targetY = window.innerHeight * 0.55;
  return Phaser.Math.Distance.Between(clientX, clientY, targetX, targetY) <= 160;
};

export const createBaseDrag = (scene: Phaser.Scene, nativeEvent: MouseEvent | TouchEvent, config: BaseDragConfig): void => {
  const state = usePetCareStore.getState().currentAnim;
  if (state !== 'prostoi1' && state !== 'prostoi2') return;

  const isTouchEvent = 'touches' in nativeEvent;
  const touch = isTouchEvent 
    ? (nativeEvent.touches?.[0] || nativeEvent.changedTouches?.[0]) 
    : (nativeEvent as MouseEvent);

  if (!touch || typeof touch.clientX !== 'number') return;

  const snd = scene.sound as any;
  if (snd?.context?.state === 'suspended') {
    snd.context.resume();
  }

  const dragImg = document.createElement('img');
  dragImg.src = config.url;
  dragImg.className = "fixed w-20 h-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50";
  dragImg.style.left = `${touch.clientX}px`;
  dragImg.style.top = `${touch.clientY}px`;
  
  // Изначально аппендится в body, здесь всё ок
  document.body.appendChild(dragImg);

  const onGlobalMove = (e: MouseEvent | TouchEvent): void => {
    if (e.cancelable) e.preventDefault();
    const currentTouch = 'touches' in e ? (e.touches?.[0] || e.changedTouches?.[0]) : (e as MouseEvent);
    if (!currentTouch || typeof currentTouch.clientX !== 'number') return;
    dragImg.style.left = `${currentTouch.clientX}px`;
    dragImg.style.top = `${currentTouch.clientY}px`;
  };

  const onGlobalUp = (e: MouseEvent | TouchEvent): void => {
    cleanup();
    const endTouch = 'touches' in e ? (e.touches?.[0] || e.changedTouches?.[0]) : (e as MouseEvent);
    const endX = endTouch?.clientX ?? touch.clientX;
    const endY = endTouch?.clientY ?? touch.clientY;

    if (checkOverlapWithPetCSS(endX, endY)) {
      dragImg.remove();
      
      if (!config.delaySound && scene.cache.audio.exists(config.action)) {
        scene.sound.play(config.action);
      }
      
      usePetCareStore.getState().triggerCareAction(config.action);
      scene.events.emit(`care_trigger_${config.action}`);
      config.onSuccess(endX, endY);
    } else {
      dragImg.style.transition = 'all 200ms ease-out';
      dragImg.style.opacity = '0';
      dragImg.style.transform = 'translate(-50%, -50%) scale(0)';
      window.setTimeout(() => dragImg.remove(), 200);
    }
  };

  const cleanup = (): void => {
    window.removeEventListener('mousemove', onGlobalMove);
    window.removeEventListener('mouseup', onGlobalUp);
    window.removeEventListener('touchmove', onGlobalMove);
    window.removeEventListener('touchend', onGlobalUp);
    window.removeEventListener('touchcancel', onGlobalUp);
  };

  window.addEventListener('mousemove', onGlobalMove, { passive: false });
  window.addEventListener('mouseup', onGlobalUp, { passive: false });
  window.addEventListener('touchmove', onGlobalMove, { passive: false });
  window.addEventListener('touchend', onGlobalUp, { passive: false });
  window.addEventListener('touchcancel', onGlobalUp, { passive: false });

  scene.events.once('shutdown', () => { 
    cleanup(); 
    dragImg.remove(); 
  });
};
