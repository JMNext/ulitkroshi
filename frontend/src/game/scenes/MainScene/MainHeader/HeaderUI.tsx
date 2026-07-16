import React from 'react';
import { useMainGameStore } from '../useMainGameStore';

import coinIcon from '../../../../assets/buttom_menu-icons/eat.svg';
import avatarIcon from '../../../../assets/interface-icons/icon-avatar.svg';
import plusIcon from '../../../../assets/interface-icons/plus.svg';

interface HeaderUIProps {
  onPlusClick: () => void;
  onAvatarClick: () => void;
}

export const HeaderUI = ({ onPlusClick, onAvatarClick }: HeaderUIProps) => {
  const coins = useMainGameStore((state) => state.coins);

  return (
    <header className="flex justify-between items-start w-full box-border pointer-events-none pt-[clamp(24px,5vh,50px)] px-[clamp(12px,4vw,40px)]">
      <div className="flex items-center justify-between bg-white rounded-full overflow-hidden box-border border border-[#f1f5f9] h-[clamp(42px,7.5vh,70px)] w-[clamp(150px,22vw,240px)] pointer-events-auto">
        <div className="flex items-center justify-between w-full h-full box-border px-[clamp(8px,1.2vw,14px)]">
          <img src={coinIcon} className="shrink-0 object-contain h-[70%] w-auto" alt="cookie" /> 
          <span className="flex-1 text-center font-black text-[#1a3d1c] select-none text-[clamp(16px,2.5vh,26px)] leading-[clamp(42px,7.5vh,70px)]">
            {coins}
          </span>
          <img 
            src={plusIcon} 
            className="shrink-0 object-contain h-[70%] w-auto cursor-pointer transition-transform duration-100 ease-out active:scale-90" 
            alt="plus" 
            onClick={onPlusClick}
          />
        </div>
      </div>

      <div 
        className="relative z-50 cursor-pointer pointer-events-auto transition-transform duration-100 ease-out active:scale-95 box-border h-[clamp(60px,11vh,100px)] w-[clamp(60px,11vh,100px)]" 
        onClick={onAvatarClick}
      >
        <img src={avatarIcon} className="relative z-51 w-full h-full object-cover rounded-full pointer-events-auto" alt="avatar" />
      </div>
    </header>
  );
};
