import { createBaseDrag } from "./baseDrag";
import playIconUrl from "../../../../../assets/buttom_menu-icons/play.svg";

export const startPlayingDrag = (scene: Phaser.Scene, e: TouchEvent | MouseEvent) => {
  createBaseDrag(scene, e, {
    url: playIconUrl,
    onSuccess: (startX, startY) => {
      const targetX = window.innerWidth / 2 + 180; 
      const targetY = window.innerHeight * 0.52 - 30;

      const item = document.createElement('img');
      item.src = playIconUrl;
      item.style.cssText = 'position: fixed; left: ' + startX + 'px; top: ' + startY + 'px; width: 80px; height: 80px; transform: translate(-50%, -50%); pointer-events: none; z-index: 50;';
      document.getElementById('game-container')?.appendChild(item);

      scene.events.emit('care_trigger_play');

      const HIT_TIMING = 1750; 

      item.animate([
        { left: startX + 'px', top: startY + 'px', transform: 'translate(-50%, -50%) scale(1)' },
        { left: ((startX + targetX) / 2) + 'px', top: (((startY + targetY) / 2) - Math.abs(startX - targetX) * 0.15) + 'px', transform: 'translate(-50%, -50%) scale(1.45)' },
        { left: targetX + 'px', top: targetY + 'px', transform: 'translate(-50%, -50%) scale(2)' }
      ], {
        duration: HIT_TIMING,
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
      });

      setTimeout(() => {
        const bounce = item.animate([
          { left: targetX + 'px', top: targetY + 'px', transform: 'translate(-50%, -50%) rotate(0deg) scale(2)' },
          { left: (targetX - 250) + 'px', top: (targetY - 260) + 'px', transform: 'translate(-50%, -50%) rotate(-270deg) scale(1.6)' },
          { left: (targetX - 500) + 'px', top: '-150px', transform: 'translate(-50%, -50%) rotate(-600deg) scale(1.2)' }
        ], {
          duration: 1100,
          easing: 'cubic-bezier(0.33, 1, 0.68, 1)'
        });

        bounce.onfinish = () => item.remove();
      }, HIT_TIMING);
    }
  });
};
