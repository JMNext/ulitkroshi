import React from 'react';

interface MobileControlsProps { 
  type: 'horizontal' | 'cross'; 
  onChangeDir: (dir: any) => void; 
}

const BTN_STYLE = 'w-[52px] h-[52px] xs:w-[60px] xs:h-[60px] sm:w-[80px] sm:h-[80px] bg-gradient-to-b from-white to-slate-100 border border-slate-300 shadow-[0_4px_10px_rgba(0,0,0,0.15)] font-black flex items-center justify-center select-none rounded-full transition-all cursor-pointer pointer-events-auto active:scale-90 touch-none';

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
      <div className="absolute inset-x-0 bottom-0 pb-6 sm:pb-12 px-6 flex justify-between w-full pointer-events-none z-30 env-safe-bottom">
        <button onTouchStart={start('LEFT')} onTouchEnd={end()} onMouseDown={start('LEFT')} onMouseUp={end()} onMouseLeave={end()} className={BTN_STYLE}>
          <div className="pointer-events-none w-0 h-0 border-t-[8px] xs:border-t-[10px] sm:border-t-[12px] border-t-transparent border-b-[8px] xs:border-b-[10px] sm:border-b-[12px] border-b-transparent border-r-[12px] xs:border-r-[15px] sm:border-r-[18px] border-r-slate-700 mr-0.5" />
        </button>
        <button onTouchStart={start('RIGHT')} onTouchEnd={end()} onMouseDown={start('RIGHT')} onMouseUp={end()} onMouseLeave={end()} className={BTN_STYLE}>
          <div className="pointer-events-none w-0 h-0 border-t-[8px] xs:border-t-[10px] sm:border-t-[12px] border-t-transparent border-b-[8px] xs:border-b-[10px] sm:border-b-[12px] border-b-transparent border-l-[12px] xs:border-l-[15px] sm:border-l-[18px] border-l-slate-700 ml-0.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute right-4 bottom-4 md:right-8 md:bottom-8 portrait:right-1/2 portrait:translate-x-1/2 portrait:bottom-2 pointer-events-none z-30 env-safe-bottom">
      <div className="relative w-[145px] h-[135px] xs:w-[170px] xs:h-[160px] sm:w-[220px] sm:h-[200px] flex items-center justify-center pointer-events-none">
        <button onTouchStart={start('UP')} onMouseDown={start('UP')} className={`absolute top-0 left-1/2 -translate-x-1/2 ${BTN_STYLE}`}>
          <div className="pointer-events-none w-0 h-0 border-l-[8px] xs:border-l-[10px] sm:border-l-[12px] border-l-transparent border-r-[8px] xs:border-r-[10px] sm:border-r-[12px] border-r-transparent border-b-[12px] xs:border-b-[15px] sm:border-b-[18px] border-b-slate-700 mb-0.5" />
        </button>
        <button onTouchStart={start('DOWN')} onMouseDown={start('DOWN')} className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${BTN_STYLE}`}>
          <div className="pointer-events-none w-0 h-0 border-l-[8px] xs:border-l-[10px] sm:border-l-[12px] border-l-transparent border-r-[8px] xs:border-r-[10px] sm:border-r-[12px] border-r-transparent border-t-[12px] xs:border-t-[15px] sm:border-t-[18px] border-t-slate-700 mt-0.5" />
        </button>
        <button onTouchStart={start('LEFT')} onMouseDown={start('LEFT')} className={`absolute left-0 top-1/2 -translate-y-1/2 ${BTN_STYLE}`}>
          <div className="pointer-events-none w-0 h-0 border-t-[8px] xs:border-t-[10px] sm:border-t-[12px] border-t-transparent border-b-[8px] xs:border-b-[10px] sm:border-b-[12px] border-b-transparent border-r-[12px] xs:border-r-[15px] sm:border-r-[18px] border-r-slate-700 mr-0.5" />
        </button>
        <button onTouchStart={start('RIGHT')} onMouseDown={start('RIGHT')} className={`absolute right-0 top-1/2 -translate-y-1/2 ${BTN_STYLE}`}>
          <div className="pointer-events-none w-0 h-0 border-t-[8px] xs:border-t-[10px] sm:border-t-[12px] border-t-transparent border-b-[8px] xs:border-b-[10px] sm:border-b-[12px] border-b-transparent border-l-[12px] xs:border-l-[15px] sm:border-l-[18px] border-l-slate-700 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
