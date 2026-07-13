import React, { useState, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { RegistrationLogic_Step3 } from './RegistrationLogic_Step3';

let regUiRoot3: Root | null = null;
let globalSetMode3: ((mode: 'select' | 'confirm' | 'verify' | 'error') => void) | null = null;
let globalSetSelectedFruits3: ((selected: number[]) => void) | null = null;
let globalSetCorrectFruits3: ((correct: number[]) => void) | null = null;
let globalTriggerShake3: (() => void) | null = null;

const ID_MAP: Record<number, string> = {
  0: '01', 1: '02', 2: '0003_13', 3: '03', 4: '04', 5: '05', 6: '06', 7: '0007_09',
  8: '07', 9: '08', 10: '10', 11: '11', 12: '12', 13: '14', 14: '15', 15: '16'
};

export const renderRegistrationUI_Step3 = (scene: any, logicInstance: RegistrationLogic_Step3): void => {
  destroyRegistrationUI_Step3();
  const container = document.createElement('div');
  container.id = 'registration-fruits-overlay';
  container.className = 'absolute inset-0 pointer-events-none z-30 flex justify-center';
  document.getElementById('game-container')?.appendChild(container);

  regUiRoot3 = createRoot(container);
  regUiRoot3.render(<RegistrationUIComponent3 logic={logicInstance} />);
};

export const destroyRegistrationUI_Step3 = (): void => {
  if (regUiRoot3) { 
    regUiRoot3.unmount(); 
    regUiRoot3 = null; 
  }
  document.getElementById('registration-fruits-overlay')?.remove();
  globalSetMode3 = null; 
  globalSetSelectedFruits3 = null; 
  globalSetCorrectFruits3 = null; 
  globalTriggerShake3 = null;
};

export const setRegistrationCaptchaModeUI = (mode: 'select' | 'confirm' | 'verify' | 'error'): void => { 
  if (globalSetMode3) globalSetMode3(mode); 
};

export const setRegistrationSelectedFruitsUI = (selected: number[]): void => { 
  if (globalSetSelectedFruits3) globalSetSelectedFruits3(selected); 
};

export const setRegistrationCorrectFruitsUI = (correct: number[]): void => { 
  if (globalSetCorrectFruits3) globalSetCorrectFruits3(correct); 
};

export const triggerRegistrationShakeUI = (): void => { 
  if (globalTriggerShake3) globalTriggerShake3(); 
};

const RegistrationUIComponent3 = ({ logic }: { logic: RegistrationLogic_Step3 }) => {
  const [mode, setMode] = useState<'select' | 'confirm' | 'verify' | 'error'>(logic.getMode());
  const [selected, setSelected] = useState<number[]>(logic.getSelected());
  const [correct, setCorrect] = useState<number[]>(logic.getCorrect());
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const handleResize = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);

    globalSetMode3 = setMode;
    globalSetSelectedFruits3 = setSelected;
    globalSetCorrectFruits3 = setCorrect;
    
    let timer: any = null;
    globalTriggerShake3 = () => {
      setShake(true);
      timer = setTimeout(() => setShake(false), 400);
    };
    
    return () => { 
      window.removeEventListener('resize', handleResize);
      if (timer) clearTimeout(timer);
      globalSetMode3 = null; 
      globalSetSelectedFruits3 = null; 
      globalSetCorrectFruits3 = null; 
      globalTriggerShake3 = null; 
    };
  }, []);

  const titles = {
    select: 'Выбери 4 фрукта<br/>и запомни их!',
    confirm: 'Запомнил?',
    verify: 'А теперь повтори фрукты,<br/>которые ты запомнил!',
    error: 'Что то не так, давай<br/>еще раз!'
  };

  const isConfirm = mode === 'confirm';
  const isPortrait = dims.width < dims.height;
  const uiScale = isPortrait ? 0.75 : 1.0;

  const centerBlockStyle: React.CSSProperties = {
    transform: `translate(-50%, -50%) scale(${uiScale})`,
    transformOrigin: 'center center',
  };

  return (
    <div style={centerBlockStyle} className={`absolute top-[48%] left-1/2 flex flex-col items-center w-[360px] h-[680px] z-20 pointer-events-none font-sans select-none text-center ${shake ? 'animate-shake' : ''}`}>
      <style>{`
        @keyframes delicate-shake {
          0%, 100% { transform: translate(-50%, -50%) scale(${uiScale}) translateX(0); }
          20%, 60% { transform: translate(-50%, -50%) scale(${uiScale}) translateX(-6px); }
          40%, 80% { transform: translate(-50%, -50%) scale(${uiScale}) translateX(6px); }
        }
        .animate-shake { animation: delicate-shake 0.4s ease-in-out; }
      `}</style>

      <div className="w-full bg-white/95 backdrop-blur-sm rounded-[38px] px-6 pt-5 shadow-xl relative z-30 border border-slate-100/50 pointer-events-auto h-[200px]">
        <div className="w-full h-[60px] flex items-center justify-center text-[22px] font-black text-slate-700 leading-tight tracking-wide mb-5" dangerouslySetInnerHTML={{ __html: titles[mode] || titles.select }} />
        <div className="flex gap-4 justify-center">
          {Array.from({ length: 4 }).map((_, i) => {
            const activeArray = isConfirm ? correct : selected;
            const fruitIdx = i < activeArray.length ? activeArray[i] : null;
            if (fruitIdx !== null) {
              return (
                <div key={i} className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center p-1 shadow-inner border border-gray-100">
                  <img src={`/assets/fruits/fruits_${ID_MAP[fruitIdx]}.png`} className="w-full h-full object-contain pointer-events-none" alt="slot" />
                </div>
              );
            }
            return <div key={i} className="w-14 h-14 rounded-full bg-[#f4f1ee] border border-solid border-gray-200/60 shadow-inner" />;
          })}
        </div>
        <div className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[12px] border-transparent border-t-[12px] border-t-white/95" />
      </div>

      <div className="w-full flex flex-col items-center pointer-events-auto z-30 mt-[34px]">
        <div className="w-full relative h-[320px] flex flex-col items-center">
          <div className={`grid grid-cols-4 gap-4 w-full transition-opacity duration-200 ${isConfirm ? 'opacity-40 pointer-events-none' : ''}`}>
            {Array.from({ length: 16 }).map((_, idx) => {
              const isSelected = selected.includes(idx);
              const hasBorder = isSelected && mode !== 'error' && mode !== 'verify';
              return (
                <button key={idx} onClick={() => logic.handleFruitToggle(idx)} className={`h-16 w-16 bg-white rounded-full shadow-md active:scale-95 flex items-center justify-center p-2 cursor-pointer border-4 transition-all ${hasBorder ? 'border-[#a6f034]' : 'border-transparent'}`}>
                  <img src={`/assets/fruits/fruits_${ID_MAP[idx]}.png`} className="w-full h-full object-contain pointer-events-none" alt="fruit" />
                </button>
              );
            })}
          </div>

          {isConfirm && (
            <div className="absolute inset-x-0 top-[20px] bg-white border border-gray-100 rounded-[28px] shadow-2xl p-5 flex flex-col items-center gap-4 text-center z-40 animate-fade-in pointer-events-auto w-[280px] mx-auto">
              <div className="text-2xl font-black text-gray-700">Запомнил?</div>
              <button onClick={() => logic.handleConfirmYes()} className="w-36 h-11 text-white font-extrabold text-xl rounded-2xl border-b-4 border-[#366901] bg-gradient-to-b from-[#81c714] to-[#4c9203] shadow-md cursor-pointer active:translate-y-[2px]">Да!</button>
            </div>
          )}
        </div>

        <button onClick={() => logic.handleResetClick()} className={`w-[260px] h-12 text-white font-extrabold text-xl rounded-2xl border-b-4 border-[#cd2b46] bg-[#e63956] shadow-md cursor-pointer mt-12 ${isConfirm ? 'opacity-40 pointer-events-none' : 'active:translate-y-[2px]'}`}>
          <span className="-mt-0.5 block">Сбросить</span>
        </button>
      </div>
    </div>
  );
};
