import { SyntheticEvent, useEffect, useState } from 'react';

interface MobileControlsProps {
  type: 'horizontal' | 'cross'; onChangeDir: (dir: string | number) => void;
  metrics?: { isPortrait: boolean; isSmall: boolean; isTablet: boolean; startY: number; totalGridH: number; startX: number; totalGridW: number; };
}

const D_PAD = [
  { dir: 'UP', btn: 'left-1/2 -translate-x-1/2 top-0', tri: 'border-l-[6px] border-r-[6px] border-b-[10px] border-t-0 border-l-transparent border-r-transparent border-b-slate-700 mb-[2px]' },
  { dir: 'DOWN', btn: 'left-1/2 -translate-x-1/2 bottom-0', tri: 'border-l-[6px] border-r-[6px] border-t-[10px] border-b-0 border-l-transparent border-r-transparent border-t-slate-700 mt-[2px]' },
  { dir: 'LEFT', btn: 'top-1/2 -translate-y-1/2 left-0', tri: 'border-t-[6px] border-b-[6px] border-r-[10px] border-l-0 border-t-transparent border-b-transparent border-r-slate-700 mr-[2px]' },
  { dir: 'RIGHT', btn: 'top-1/2 -translate-y-1/2 right-0', tri: 'border-t-[6px] border-b-[6px] border-l-[10px] border-r-0 border-t-transparent border-b-transparent border-l-slate-700 ml-[2px]' },
];

export const MobileControls = ({ type, onChangeDir, metrics }: MobileControlsProps) => {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => { setIsTouch(window.matchMedia('(pointer: coarse)').matches || ('ontouchstart' in window) || navigator.maxTouchPoints > 0); }, []);
  if (!isTouch) return null;

  const isSmall = metrics?.isSmall ?? false, isPortrait = metrics?.isPortrait ?? false, isTablet = metrics?.isTablet ?? false;
  const hStart = (dir: string | number) => (e: SyntheticEvent) => { e.stopPropagation(); if (e.nativeEvent) { e.nativeEvent.stopImmediatePropagation(); e.nativeEvent.preventDefault(); } onChangeDir(dir); };
  const hEnd = () => (e: SyntheticEvent) => { e.stopPropagation(); if (e.nativeEvent) { e.nativeEvent.stopImmediatePropagation(); e.nativeEvent.preventDefault(); } if (type === 'horizontal') onChangeDir(0); };

  const btnB = `pointer-events-auto active:scale-90 transition-all flex items-center justify-center cursor-pointer bg-gradient-to-b from-white to-slate-100 border border-solid border-slate-300 shadow-[0_3px_8px_rgba(0,0,0,0.12)] rounded-full p-0 m-0 outline-none ${isSmall ? 'w-[40px] h-[40px]' : 'w-[52px] h-[52px]'}`;
  const triB = "pointer-events-none w-0 h-0 transition-transform border-solid block";

  if (type === 'horizontal') {
    return (
      <nav style={{ touchAction: 'none' }} className="w-full h-full flex justify-between items-center pointer-events-none box-border px-12">
        {D_PAD.filter(p => ['LEFT', 'RIGHT'].includes(p.dir)).map(p => (
          <button key={p.dir} type="button" onTouchStart={hStart(p.dir)} onTouchEnd={hEnd()} onMouseDown={hStart(p.dir)} onMouseUp={hEnd()} onMouseLeave={hEnd()} className={btnB}><span className={`${triB} ${p.tri}`} /></button>
        ))}
      </nav>
    );
  }

  const pSize = isSmall ? 120 : 160;
  if (isPortrait) {
    return (
      <nav style={{ touchAction: 'none' }} className="w-full h-full flex items-center justify-center pointer-events-none">
        <div style={{ width: `${pSize}px`, height: `${pSize}px` }} className="relative pointer-events-none">
          {D_PAD.map(p => (
            <button key={p.dir} type="button" onTouchStart={hStart(p.dir)} onMouseDown={hStart(p.dir)} className={`${btnB} absolute ${p.btn}`}><span className={`${triB} ${p.tri}`} /></button>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav style={{ touchAction: 'none' }} className={`pointer-events-none z-30 absolute inset-y-0 right-0 flex items-center justify-end ${isTablet ? 'pr-12' : 'pr-16'}`}>
      <div className={`relative pointer-events-none scale-95 ${isTablet ? 'w-[160px] h-[160px]' : 'w-[140px] h-[140px]'}`}>
        {D_PAD.map(p => (
          <button key={p.dir} type="button" onTouchStart={hStart(p.dir)} onMouseDown={hStart(p.dir)} className={`${btnB} absolute ${p.btn}`}><span className={`${triB} ${p.tri}`} /></button>
        ))}
      </div>
    </nav>
  );
};
