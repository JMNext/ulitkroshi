import React, { useState, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { RegistrationLogic_Step4 } from './RegistrationLogic_Step4';

let regUiRoot4: Root | null = null;

export const renderRegistrationUI_Step4 = (onComplete: () => void): void => {
  destroyRegistrationUI_Step4();
  const container = document.createElement('div');
  container.id = 'registration-success-overlay';
  container.className = 'absolute inset-0 pointer-events-none z-30 flex justify-center';
  document.getElementById('game-container')?.appendChild(container);

  regUiRoot4 = createRoot(container);
  regUiRoot4.render(<RegistrationUIComponent4 onComplete={onComplete} />);
};

export const destroyRegistrationUI_Step4 = (): void => {
  if (regUiRoot4) { 
    regUiRoot4.unmount(); 
    regUiRoot4 = null; 
  }
  document.getElementById('registration-success-overlay')?.remove();
};

const RegistrationUIComponent4 = ({ onComplete }: { onComplete: () => void }) => {
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });
  const logicRef = useRef<RegistrationLogic_Step4 | null>(null);
  
  if (!logicRef.current) {
    logicRef.current = new RegistrationLogic_Step4(onComplete);
  }

  useEffect(() => {
    const handleResize = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPortrait = dims.width < dims.height;
  const uiScale = isPortrait ? 0.75 : 1.0;

  const styleConfig = {
    bubble: { transform: `scale(${uiScale})`, transformOrigin: 'top center' },
    petVideo: { transform: `translate(-50%, -50%) scale(${uiScale})`, transformOrigin: 'center center' },
    bottomControls: { transform: `translateX(-50%) scale(${uiScale})`, transformOrigin: 'bottom center' }
  };

  return (
    <div className="fixed inset-0 pointer-events-none w-full h-full font-sans select-none z-30 flex justify-center overflow-hidden">
      <div style={styleConfig.bubble} className="absolute top-[4%] pointer-events-auto bg-white/95 backdrop-blur-sm rounded-[32px] px-10 py-5 text-center shadow-xl max-w-lg w-[45vw] min-w-[320px] z-30 flex items-center justify-center border border-slate-100/50 box-border">
        <div className="text-[22px] font-black text-slate-700 leading-normal tracking-wide">
          Поздравляю!<br />Ты владелец<br />улиткроша!
        </div>
        <div className="absolute bottom-[-12px] left-[45%] w-0 h-0 border-x-[12px] border-x-transparent border-t-[12px] border-t-white/95" />
      </div>

      <div style={styleConfig.petVideo} className="absolute top-[42%] left-1/2 w-[644px] h-[644px] pointer-events-none z-10">
        <video src="/assets/resources/1stpet-animation/happy.webm" muted playsInline autoPlay loop className="w-full h-full object-contain drop-shadow-md" />
      </div>

      <div style={styleConfig.bottomControls} className="absolute bottom-[40px] left-1/2 pointer-events-auto z-30">
        <button onClick={() => logicRef.current?.handleFinalPlayClick()} className="w-[319px] h-[64px] text-white font-black text-xl uppercase tracking-wider rounded-full border-t-2 border-b-0 border-x-0 border-[#fcd34d] bg-gradient-to-b from-[#f59e0b] to-[#b45309] shadow-[0_5px_0_0_#78350f,0_8px_12px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-[0_2px_0_0_#78350f,0_4px_6px_rgba(0,0,0,0.4)] transition-all cursor-pointer flex items-center justify-center select-none">
          Вперед в игру
        </button>
      </div>
    </div>
  );
};
