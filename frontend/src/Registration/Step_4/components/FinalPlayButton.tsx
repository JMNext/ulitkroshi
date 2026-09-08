import React from 'react';

interface FinalPlayButtonProps {
  onClick: () => void;
}

export const FinalPlayButton = ({ onClick }: FinalPlayButtonProps) => {
  return (
    <div className="flex items-center justify-center w-[400px] h-[64px]">
      <button 
        type="button" 
        onClick={() => {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
          onClick();
        }} 
        className="w-[380px] h-full px-10 font-black text-white flex items-center justify-center border-none uppercase tracking-wide shadow-md active:scale-95 transition-all duration-100 ease-out outline-none rounded-full text-[24px] box-border cursor-pointer bg-gradient-to-b from-[#f59e0b] to-[#d97706] whitespace-nowrap pointer-events-auto select-none touch-manipulation mx-auto"
      >
        Вперед в игру
      </button>
    </div>
  );
};
