import { Scene } from 'phaser';
import React from 'react';
import menuBgDesktop from '../../../../assets/background/bottom-menu-desktop.svg';
import buttonBgUrl from '../../../../assets/buttom_menu-icons/button.svg';
import eatIcon from '../../../../assets/buttom_menu-icons/eat.svg';
import playIcon from '../../../../assets/buttom_menu-icons/play.svg';
import sleepIconActual from '../../../../assets/buttom_menu-icons/sleep.svg';
import washIcon from '../../../../assets/buttom_menu-icons/wash.svg';
import { startFeedingDrag } from '../PetCharacter/animations/feedPet';
import { startPlayingDrag } from '../PetCharacter/animations/playBall';
import { triggerSleepingClick } from '../PetCharacter/animations/sleepPet';
import { startWashingDrag } from '../PetCharacter/animations/washPet';
import { usePetCareStore } from '../usePetCareStore';

interface BottomMenuProps {
  scene: Scene;
}

export const BottomMenu = ({ scene }: BottomMenuProps) => {
  const currentAnim = usePetCareStore((state) => state.currentAnim);

  const items = [
    {
      text: 'Кормить',
      icon: eatIcon,
      action: (e: any) => startFeedingDrag(scene, e),
      animKeys: ['eat', 'feeding'],
      glowClass: 'shadow-[0_0_20px_#f59e0b]',
    },
    {
      text: 'Мыть',
      icon: washIcon,
      action: (e: any) => startWashingDrag(scene, e),
      animKeys: ['wash', 'washing'],
      glowClass: 'shadow-[0_0_20px_#0ea5e9]',
    },
    {
      text: 'Играть',
      icon: playIcon,
      action: (e: any) => startPlayingDrag(scene, e),
      animKeys: ['play', 'playing'],
      glowClass: 'shadow-[0_0_20px_#f43f5e]',
    },
    {
      text: 'Спать',
      icon: sleepIconActual,
      action: (e: any) => triggerSleepingClick(scene),
      animKeys: ['sleep_begin', 'sleep_circle'],
      glowClass: 'shadow-[0_0_20px_#a855f7]',
    },
  ];

  const handleStart = (item: any, e: any) => {
    item.action(e.nativeEvent);
  };

  return (
    <div className="relative w-[1080px] h-auto flex items-end justify-center box-border select-none pointer-events-auto origin-bottom touch-none">
      <img
        src={menuBgDesktop}
        className="w-full h-auto object-contain pointer-events-none block transform portrait:translate-y-[60px] landscape:translate-y-0"
        alt="menu-bg"
      />

      <nav className="z-20 flex items-center justify-center box-border absolute left-1/2 -translate-x-1/2 bottom-[40px] landscape:bottom-[30px] w-full portrait:w-[340px] gap-[4%] portrait:gap-2 px-[8%] portrait:px-0 touch-none">
        {items.map((item) => {
          const isActive = item.animKeys.includes(currentAnim);

          return (
            <button
              key={item.text}
              onMouseDown={(e) => handleStart(item, e)}
              onTouchStart={(e) => handleStart(item, e)}
              className="flex flex-col items-center shrink-0 outline-none border-none bg-transparent hover:scale-105 active:scale-95 transition-transform duration-150 ease-out cursor-pointer w-[120px] max-w-[120px] portrait:w-[78px] portrait:max-w-[78px] touch-none select-none"
            >
              <div className={`relative flex items-center justify-center rounded-full transition-all duration-150 ${isActive ? item.glowClass : ''} w-[110px] h-[110px] max-w-[110px] max-h-[110px] portrait:w-[74px] portrait:h-[74px] portrait:max-w-[74px] portrait:max-h-[74px]`}>
                <img
                  src={buttonBgUrl}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                  alt="btn bg"
                />
                <img
                  src={item.icon}
                  className="absolute object-contain pointer-events-none block w-[68px] h-[68px] max-w-[68px] max-h-[68px] portrait:w-[46px] portrait:h-[46px] portrait:max-w-[46px] portrait:max-h-[46px]"
                  alt={item.text}
                />
              </div>

              <span className={`w-full max-w-full h-auto text-center font-black tracking-wide leading-none block pointer-events-none text-[20px] portrait:text-[13px] mt-[18px] portrait:mt-[8px] ${isActive ? 'text-black' : 'text-neutral-600'}`}>
                {item.text}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};