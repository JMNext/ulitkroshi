import React from 'react';

interface FinalPlayButtonProps {
  bottomPosition: string;
  controlsScale: number;
  onClick: () => void;
}

export const FinalPlayButton = ({ bottomPosition, controlsScale, onClick }: FinalPlayButtonProps) => {
  const controlsStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    bottom: bottomPosition,
    transform: `translateX(-50%) scale(${controlsScale})`,
    transformOrigin: 'bottom center',
  };

  return (
    <div style={controlsStyle} className="pointer-events-auto z-30 w-full max-w-[340px] flex justify-center px-4 box-border">
      <button 
        onClick={onClick} 
        className="w-full max-w-[319px] h-[64px] text-white font-black text-xl uppercase tracking-wider rounded-full border-t-2 border-b-0 border-x-0 border-[#fcd34d] bg-gradient-to-b from-[#f59e0b] to-[#b45309] shadow-[0_5px_0_0_#78350f,0_8px_12px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-[0_2px_0_0_#78350f,0_4px_6px_rgba(0,0,0,0.4)] transition-all cursor-pointer flex items-center justify-center select-none box-border"
      >
        Вперед в игру
      </button>
    </div>
  );
};
