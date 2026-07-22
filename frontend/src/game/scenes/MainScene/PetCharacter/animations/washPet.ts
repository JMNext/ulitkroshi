import Phaser from 'phaser';
import { createBaseDrag } from "./baseDrag";
import washIconUrl from "../../../../../assets/buttom_menu-icons/wash.svg";
import { usePetCareStore } from '../../usePetCareStore';

export const startWashingDrag = (scene: Phaser.Scene, e: TouchEvent | MouseEvent) => {
  createBaseDrag(scene, e, {
    url: washIconUrl,
    action: 'wash',
    onSuccess: (startX, startY) => {
      let targetX: number = window.innerWidth / 2;
      let targetY: number = window.innerHeight * 0.55;

      const petElement: Element | null = document.querySelector('.pet-anim-prostoi1') || document.querySelector('.pet-anim-prostoi2');
      if (petElement) {
        const rect: DOMRect = petElement.getBoundingClientRect();
        targetX = window.innerWidth / 2;
        targetY = rect.top + rect.height / 2;
      }

      const item: HTMLImageElement = document.createElement('img');
      item.src = washIconUrl;
      item.className = "fixed w-20 h-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50";
      item.style.left = `${startX}px`;
      item.style.top = `${startY}px`;
      
      // ИСПРАВЛЕНО: Аппендим напрямую в body, так как game-container отсутствует
      document.body.appendChild(item);

      usePetCareStore.getState().triggerCareAction('wash');

      const flight: Animation = item.animate([
        { left: `${startX}px`, top: `${startY}px`, transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { left: `${targetX}px`, top: `${targetY}px`, transform: 'translate(-50%, -50%) scale(0.3)', opacity: 0 }
      ], {
        duration: 400,
        easing: 'ease-out'
      });

      flight.onfinish = () => item.remove();
    }
  });
};
