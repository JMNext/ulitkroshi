import { createBaseDrag } from "./baseDrag";
import washIconUrl from "../../../../../assets/buttom_menu-icons/wash.svg";

export const startWashingDrag = (scene: Phaser.Scene, e: TouchEvent | MouseEvent) => {
  createBaseDrag(scene, e, {
    url: washIconUrl,
    onSuccess: (startX, startY) => {
      const targetX = window.innerWidth / 2 - 40;
      const targetY = window.innerHeight * 0.55;

      const item = document.createElement('img');
      item.src = washIconUrl;
      item.style.cssText = `
        position: fixed;
        left: ${startX}px;
        top: ${startY}px;
        width: 80px;
        height: 80px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 50;
      `;
      document.getElementById('game-container')?.appendChild(item);

      scene.events.emit('care_trigger_wash');

      const flight = item.animate([
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
