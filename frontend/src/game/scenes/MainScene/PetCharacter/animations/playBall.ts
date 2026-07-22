import Phaser from 'phaser';
import { createBaseDrag } from "./baseDrag";
import playIconUrl from "../../../../../assets/buttom_menu-icons/play.svg";

export const startPlayingDrag = (scene: Phaser.Scene, e: TouchEvent | MouseEvent) => {
  createBaseDrag(scene, e, {
    url: playIconUrl,
    action: 'play',
    delaySound: true,
    onSuccess: (startX, startY) => {
      // 1. БАЗОВЫЕ ДЕФОЛТНЫЕ КООРДИНАТЫ ЦЕНТРА ПИТОМЦА
      let petCenterX: number = window.innerWidth / 2;
      let petCenterY: number = window.innerHeight * 0.55;

      const petElement: Element | null = document.querySelector('.pet-anim-prostoi1') || document.querySelector('.pet-anim-prostoi2');
      if (petElement) {
        const rect: DOMRect = petElement.getBoundingClientRect();
        petCenterX = window.innerWidth / 2;
        petCenterY = rect.top + rect.height / 2;
      }

      // 2. НАСТРОЙКА ТОЧКИ УДАРА (Куда мяч летит из рук игрока)
      // Меняй эти цифры (в пикселях), чтобы сместить точку приземления мяча относительно центра питомца, инверсия!
      const targetX: number = petCenterX + 200; // Сдвиг вправо/влево от центра/плюс это минус/минус это плюс
      const targetY: number = petCenterY + 80;  // Сдвиг вверх/вниз от центра/плюс это минус/минус это плюс

      // 3. НАСТРОЙКА ОТСКОКА (Куда мяч отлетает после удара об питомца)
      // Смещение первой точки рикошета (вбок и вверх)
      const bounceX1: number = targetX - 150;   // Отлетает влево на 150px от точки удара
      const bounceY1: number = targetY - 160;   // Подлетает вверх на 160px от точки удара
      
      // Смещение финальной точки (куда мяч улетает за экран)
      const bounceX2: number = targetX - 300;   // Улетает влево еще дальше на 300px от точки удара

      const item: HTMLImageElement = document.createElement('img');
      item.src = playIconUrl;
      item.className = "fixed w-20 h-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50";
      item.style.left = `${startX}px`;
      item.style.top = `${startY}px`;
      
      // Аппенд в body уже настроен
      document.body.appendChild(item);

      const HIT_TIMING: number = 1750; 

      // Функция воспроизведения звука игры (по аналогии с кормлением)
      const playPlaySound = () => {
        if (scene.cache.audio.exists('play')) {
          scene.sound.play('play', { volume: 1.0 });
        }
      };

      // ТУТ ЗВУК МЕНЯТЬ НАДО ВРЕМЯ ЕГО СТАРТА (в миллисекундах)
      setTimeout(playPlaySound, 1650);

      // ПЕРВЫЙ ЭТАП: Полет мяча из рук игрока в питомца (по дуге)
      item.animate([
        { left: `${startX}px`, top: `${startY}px`, transform: 'translate(-50%, -50%) scale(1)' },
        { left: `${(startX + targetX) / 2}px`, top: `${((startY + targetY) / 2) - Math.abs(startX - targetX) * 0.15}px`, transform: 'translate(-50%, -50%) scale(1.45)' },
        { left: `${targetX}px`, top: `${targetY}px`, transform: 'translate(-50%, -50%) scale(2)' }
      ], {
        duration: HIT_TIMING,
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
      });

      // ВТОРОЙ ЭТАП: Отскок (рикошет) мяча от питомца и улет за экран
      window.setTimeout(() => {
        const bounce: Animation = item.animate([
          { left: `${targetX}px`, top: `${targetY}px`, transform: 'translate(-50%, -50%) rotate(0deg) scale(2)' },
          { left: `${bounceX1}px`, top: `${bounceY1}px`, transform: 'translate(-50%, -50%) rotate(-270deg) scale(1.6)' },
          { left: `${bounceX2}px`, top: '-150px', transform: 'translate(-50%, -50%) rotate(-600deg) scale(1.2)' }
        ], {
          duration: 1100,
          easing: 'cubic-bezier(0.33, 1, 0.68, 1)'
        });

        bounce.onfinish = () => item.remove();
      }, HIT_TIMING);
    }
  });
};
