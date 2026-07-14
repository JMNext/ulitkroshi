import React from 'react';

interface SuccessBubbleProps {
  isLandscapeTablet: boolean;
  bubbleScale: number;
}

export const SuccessBubble = ({ isLandscapeTablet, bubbleScale }: SuccessBubbleProps) => {
  const bubbleStyle: React.CSSProperties = {
    transform: `scale(${bubbleScale})`,
    transformOrigin: 'top center',
    top: isLandscapeTablet ? '2%' : '4%'
  };

  return (
    <div 
      style={bubbleStyle} 
      className="absolute pointer-events-auto bg-white/95 backdrop-blur-sm rounded-[32px] px-8 py-5 text-center shadow-xl max-w-lg portrait:w-[90vw] landscape:w-[50vw] min-w-[280px] z-30 flex items-center justify-center border border-slate-100/50 box-border"
    >
      <div className="text-[22px] font-black text-slate-700 leading-normal tracking-wide">
        Поздравляю!<br />Ты владелец<br />улиткроша!
      </div>
      <div className="absolute bottom-[-12px] left-[45%] w-0 h-0 border-x-[12px] border-x-transparent border-t-[12px] border-t-white/95" />
    </div>
  );
};
