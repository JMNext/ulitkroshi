import React from 'react';

interface MobileControlsProps { type: 'horizontal' | 'cross'; onChangeDir: (dir: any) => void; }

const BTN_STYLE = 'w-[75px] h-[75px] sm:w-[90px] sm:h-[90px] portrait:w-[85px] portrait:h-[85px] bg-gradient-to-b from-white to-slate-100 border-2 border-slate-300 shadow-[0_8px_16px_rgba(0,0,0,0.2)] font-black flex items-center justify-center select-none rounded-full transition-all cursor-pointer pointer-events-auto active:scale-90 touch-none';

export const MobileControlsUI = ({ type, onChangeDir }: MobileControlsProps) => {
  const start = (dir: any) => (e: React.SyntheticEvent) => { 
    e.stopPropagation();
    onChangeDir(dir); 
  };

  const end = () => (e: React.SyntheticEvent) => { 
    e.stopPropagation();
    if (type === 'horizontal') onChangeDir(0);
  };

  if (type === 'horizontal') {
    return (
      <div className="absolute inset-x-0 bottom-0 pb-10 sm:pb-16 px-10 portrait:px-6 flex justify-between w-full pointer-events-none z-30 env-safe-bottom">
        <button onTouchStart={start('LEFT')} onTouchEnd={end()} onMouseDown={start('LEFT')} onMouseUp={end()} onMouseLeave={end()} className={BTN_STYLE}>
          <div className="pointer-events-none w-0 h-0 border-t-[12px] sm:border-t-[14px] border-t-transparent border-b-[12px] sm:border-b-[14px] border-b-transparent border-r-[18px] sm:border-r-[22px] border-r-slate-700 mr-1" />
        </button>
        <button onTouchStart={start('RIGHT')} onTouchEnd={end()} onMouseDown={start('RIGHT')} onMouseUp={end()} onMouseLeave={end()} className={BTN_STYLE}>
          <div className="pointer-events-none w-0 h-0 border-t-[12px] sm:border-t-[14px] border-t-transparent border-b-[12px] sm:border-b-[14px] border-b-transparent border-l-[18px] sm:border-l-[22px] border-l-slate-700 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute right-6 bottom-6 portrait:right-1/2 portrait:translate-x-1/2 portrait:bottom-4 pointer-events-none z-30 env-safe-bottom">
      <div className="relative w-[210px] h-[190px] sm:w-[260px] sm:h-[240px] portrait:w-[240px] portrait:h-[220px] flex items-center justify-center pointer-events-none">
        <button onTouchStart={start('UP')} onMouseDown={start('UP')} className={`absolute top-0 left-1/2 -translate-x-1/2 ${BTN_STYLE}`}>
          <div className="pointer-events-none w-0 h-0 border-l-[12px] sm:border-l-[14px] border-l-transparent border-r-[12px] sm:border-r-[14px] border-r-transparent border-b-[18px] sm:border-b-[22px] border-b-slate-700 mb-1" />
        </button>
        <button onTouchStart={start('DOWN')} onMouseDown={start('DOWN')} className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${BTN_STYLE}`}>
          <div className="pointer-events-none w-0 h-0 border-l-[12px] sm:border-l-[14px] border-l-transparent border-r-[12px] sm:border-r-[14px] border-r-transparent border-t-[18px] sm:border-t-[22px] border-t-slate-700 mt-1" />
        </button>
        <button onTouchStart={start('LEFT')} onMouseDown={start('LEFT')} className={`absolute left-0 top-1/2 -translate-y-1/2 ${BTN_STYLE}`}>
          <div className="pointer-events-none w-0 h-0 border-t-[12px] sm:border-t-[14px] border-t-transparent border-b-[12px] sm:border-b-[14px] border-b-transparent border-r-[18px] sm:border-r-[22px] border-r-slate-700 mr-1" />
        </button>
        <button onTouchStart={start('RIGHT')} onMouseDown={start('RIGHT')} className={`absolute right-0 top-1/2 -translate-y-1/2 ${BTN_STYLE}`}>
          <div className="pointer-events-none w-0 h-0 border-t-[12px] sm:border-t-[14px] border-t-transparent border-b-[12px] sm:border-b-[14px] border-b-transparent border-l-[18px] sm:border-l-[22px] border-l-slate-700 ml-1" />
        </button>
      </div>
    </div>
  );
};
