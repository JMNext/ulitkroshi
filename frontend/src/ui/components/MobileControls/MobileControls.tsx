import { SyntheticEvent, useEffect, useState } from 'react';
import React from 'react';

interface MobileControlsProps {
  type: 'horizontal' | 'cross';
  onChangeDir: (dir: string | number) => void;
}

export const MobileControls = ({ type, onChangeDir }: MobileControlsProps) => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
      setIsSmall(window.innerHeight < 700);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const handleActionStart = (dir: string | number) => (event: SyntheticEvent) => {
    event.stopPropagation();
    onChangeDir(dir);
  };

  const handleActionEnd = () => (event: SyntheticEvent) => {
    event.stopPropagation();
    if (type === 'horizontal') onChangeDir(0);
  };

  const btnSizeClass = isSmall ? 'w-[56px] h-[56px]' : 'w-[72px] h-[72px]';
  const btnBase = `pointer-events-auto active:scale-90 transition-all flex items-center justify-center cursor-pointer bg-gradient-to-b from-white to-slate-100 border border-solid border-slate-300 shadow-[0_4px_10px_rgba(0,0,0,0.15)] rounded-full p-0 m-0 outline-none ${btnSizeClass}`;
  const triBase = "pointer-events-none w-0 h-0 transition-transform border-solid block";

  if (type === 'horizontal') {
    return (
      <nav style={{ touchAction: 'none' }} className="absolute inset-x-0 bottom-0 flex justify-between w-full pointer-events-none z-30 box-border p-6 pb-6 px-12">
        <button type="button" onTouchStart={handleActionStart('LEFT')} onTouchEnd={handleActionEnd()} onMouseDown={handleActionStart('LEFT')} onMouseUp={handleActionEnd()} onMouseLeave={handleActionEnd()} className={btnBase}>
          <span className={`${triBase} border-t-[9px] border-b-[9px] border-r-[15px] border-l-0 border-t-transparent border-b-transparent border-r-slate-700 mr-[3px]`} />
        </button>
        <button type="button" onTouchStart={handleActionStart('RIGHT')} onTouchEnd={handleActionEnd()} onMouseDown={handleActionStart('RIGHT')} onMouseUp={handleActionEnd()} onMouseLeave={handleActionEnd()} className={btnBase}>
          <span className={`${triBase} border-t-[9px] border-b-[9px] border-l-[15px] border-r-0 border-t-transparent border-b-transparent border-l-slate-700 ml-[3px]`} />
        </button>
      </nav>
    );
  }

  if (isPortrait) {
    const padSize = isSmall ? 'w-[160px] h-[160px]' : 'w-[220px] h-[220px]';
    const navBottomStyle = isSmall ? { bottom: '10px' } : { bottom: '24px' };

    return (
      <nav style={{ ...navBottomStyle, touchAction: 'none' }} className="pointer-events-none z-30 flex items-center justify-center absolute inset-x-0 flex justify-between w-full px-12">
        <div className={`relative pointer-events-none ${padSize}`}>
          <button type="button" onTouchStart={handleActionStart('UP')} onMouseDown={handleActionStart('UP')} className={`${btnBase} absolute left-1/2 -translate-x-1/2 top-0`}>
            <span className={`${triBase} border-l-[9px] border-r-[9px] border-b-[15px] border-t-0 border-l-transparent border-r-transparent border-b-slate-700 mb-[3px]`} />
          </button>
          <button type="button" onTouchStart={handleActionStart('DOWN')} onMouseDown={handleActionStart('DOWN')} className={`${btnBase} absolute left-1/2 -translate-x-1/2 bottom-0`}>
            <span className={`${triBase} border-l-[9px] border-r-[9px] border-t-[15px] border-b-0 border-l-transparent border-r-transparent border-t-slate-700 mt-[3px]`} />
          </button>
          <button type="button" onTouchStart={handleActionStart('LEFT')} onMouseDown={handleActionStart('LEFT')} className={`${btnBase} absolute top-1/2 -translate-y-1/2 left-0`}>
            <span className={`${triBase} border-t-[9px] border-b-[9px] border-r-[15px] border-l-0 border-t-transparent border-b-transparent border-r-slate-700 mr-[3px]`} />
          </button>
          <button type="button" onTouchStart={handleActionStart('RIGHT')} onMouseDown={handleActionStart('RIGHT')} className={`${btnBase} absolute top-1/2 -translate-y-1/2 right-0`}>
            <span className={`${triBase} border-t-[9px] border-b-[9px] border-l-[15px] border-r-0 border-t-transparent border-b-transparent border-l-slate-700 ml-[3px]`} />
          </button>
        </div>
      </nav>
    );
  }

  const isTablet = (window.innerWidth / window.innerHeight) < 1.75;
  const landscapePadSize = isTablet ? 'w-[220px] h-[220px]' : 'w-[180px] h-[180px]';
  const paddingRightClass = isTablet ? 'pr-12' : 'pr-16';

  return (
    <nav 
      style={{ touchAction: 'none' }} 
      className={`pointer-events-none z-30 absolute inset-y-0 right-0 flex items-center justify-end ${paddingRightClass}`}
    >
      <div className={`relative pointer-events-none ${landscapePadSize} scale-95`}>
        <button type="button" onTouchStart={handleActionStart('UP')} onMouseDown={handleActionStart('UP')} className={`${btnBase} absolute left-1/2 -translate-x-1/2 top-0`}>
          <span className={`${triBase} border-l-[9px] border-r-[9px] border-b-[15px] border-t-0 border-l-transparent border-r-transparent border-b-slate-700 mb-[3px]`} />
        </button>
        <button type="button" onTouchStart={handleActionStart('DOWN')} onMouseDown={handleActionStart('DOWN')} className={`${btnBase} absolute left-1/2 -translate-x-1/2 bottom-0`}>
          <span className={`${triBase} border-l-[9px] border-r-[9px] border-t-[15px] border-b-0 border-l-transparent border-r-transparent border-t-slate-700 mt-[3px]`} />
        </button>
        <button type="button" onTouchStart={handleActionStart('LEFT')} onMouseDown={handleActionStart('LEFT')} className={`${btnBase} absolute top-1/2 -translate-y-1/2 left-0`}>
          <span className={`${triBase} border-t-[9px] border-b-[9px] border-r-[15px] border-l-0 border-t-transparent border-b-transparent border-r-slate-700 mr-[3px]`} />
        </button>
        <button type="button" onTouchStart={handleActionStart('RIGHT')} onMouseDown={handleActionStart('RIGHT')} className={`${btnBase} absolute top-1/2 -translate-y-1/2 right-0`}>
          <span className={`${triBase} border-t-[9px] border-b-[9px] border-l-[15px] border-r-0 border-t-transparent border-b-transparent border-l-slate-700 ml-[3px]`} />
        </button>
      </div>
    </nav>
  );
};
