import React, { useState, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { RegistrationLogic_Step2 } from './RegistrationLogic_Step2';
import { PinPad } from '../components/PinPad';

let regUiRoot2: Root | null = null;
let globalSetMode2: ((mode: 'phone' | 'sent' | 'code') => void) | null = null;
let globalSetPhone2: ((phone: string) => void) | null = null;
let globalSetCode2: ((code: string) => void) | null = null;
let globalSetSecs2: ((secs: number) => void) | null = null;

export const renderRegistrationUI_Step2 = (scene: any, onComplete: () => void): void => {
  destroyRegistrationUI_Step2();
  const container = document.createElement('div');
  container.id = 'registration-phone-overlay';
  container.className = 'absolute inset-0 pointer-events-none z-30 flex justify-center';
  document.getElementById('game-container')?.appendChild(container);
  document.getElementById('game-container')?.classList.add('in-registration');

  regUiRoot2 = createRoot(container);
  regUiRoot2.render(<RegistrationUIComponent2 scene={scene} onComplete={onComplete} />);
};

export const destroyRegistrationUI_Step2 = (): void => {
  if (regUiRoot2) { 
    regUiRoot2.unmount(); 
    regUiRoot2 = null; 
  }
  document.getElementById('registration-phone-overlay')?.remove();
  document.getElementById('game-container')?.classList.remove('in-registration');
  globalSetMode2 = null; 
  globalSetPhone2 = null; 
  globalSetCode2 = null; 
  globalSetSecs2 = null;
};

export const setRegistrationModeUI = (mode: 'phone' | 'sent' | 'code'): void => { 
  if (globalSetMode2) globalSetMode2(mode); 
};

export const setRegistrationPhoneUI = (phone: string): void => { 
  if (globalSetPhone2) globalSetPhone2(phone); 
};

export const setRegistrationCodeUI = (code: string): void => { 
  if (globalSetCode2) globalSetCode2(code); 
};

export const setRegistrationSecsUI = (secs: number): void => { 
  if (globalSetSecs2) globalSetSecs2(secs); 
};

const RegistrationUIComponent2 = ({ scene, onComplete }: { scene: any; onComplete: () => void }) => {
  const [mode, setMode] = useState<'phone' | 'sent' | 'code'>('phone');
  const [phone, setPhone] = useState('+7 ( _ _ _ ) _ _ _ - _ _ - _ _');
  const [code, setCode] = useState('');
  const [secs, setSecs] = useState(60);
  const [isReady, setIsReady] = useState(false);
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });

  const logicRef = useRef<RegistrationLogic_Step2 | null>(null);

  useEffect(() => {
    const handleResize = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);

    logicRef.current = new RegistrationLogic_Step2(scene, onComplete);
    globalSetMode2 = setMode;
    globalSetPhone2 = (p) => {
      setPhone(p);
      if (logicRef.current) setIsReady(logicRef.current.getPhoneLength() === 10);
    };
    globalSetCode2 = setCode;
    globalSetSecs2 = setSecs;

    return () => {
      window.removeEventListener('resize', handleResize);
      if (logicRef.current) logicRef.current.destroy();
      globalSetMode2 = null; 
      globalSetPhone2 = null; 
      globalSetCode2 = null; 
      globalSetSecs2 = null;
    };
  }, [scene, onComplete]);

  const isPortrait = dims.width < dims.height;
  const uiScale = isPortrait ? 0.75 : 1.0;

  const centerBlockStyle: React.CSSProperties = {
    transform: `translate(-50%, -45%) scale(${uiScale})`,
    transformOrigin: 'center center',
  };

  return (
    <div style={centerBlockStyle} className="absolute top-[48%] left-1/2 pointer-events-none flex flex-col items-center w-[380px] gap-4 z-20 font-sans select-none text-center">
      <div className="w-full bg-white/95 backdrop-blur-sm rounded-[32px] px-4 py-5 shadow-xl relative z-20 border border-slate-100/50 mb-[10px]">
        {mode !== 'code' ? (
          <div className="text-[26px] font-black text-slate-700 leading-snug tracking-wide">Набери свой номер телефона!</div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <div className="text-[26px] font-black text-slate-700 leading-snug tracking-wide">Введи номер из смс!</div>
            <button disabled={secs > 0} onClick={() => logicRef.current?.resend()} className={`text-[17px] font-black mt-2 block w-[350px] text-center underline tracking-tight whitespace-nowrap transition-colors ${secs > 0 ? 'text-slate-500 cursor-default' : 'text-emerald-600 cursor-pointer'}`}>
              {secs > 0 ? `Отправить повторно через ${secs} сек` : 'Отправить повторно'}
            </button>
          </div>
        )}
        <div className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-[12px] border-transparent border-t-[12px] border-t-white/95" />
      </div>

      {mode !== 'code' ? (
        <div className="w-[380px] h-[76px] bg-white flex items-center justify-center text-[24px] font-black rounded-full shadow-lg border border-slate-50 text-slate-700 tracking-wide mb-[10px]">
          {phone}
        </div>
      ) : (
        <div className="w-[240px] h-[80px] bg-white flex items-center justify-center text-[38px] font-black rounded-full shadow-lg border border-slate-50 text-slate-700 tracking-[10px] pl-[10px] mb-[10px]">
          {code || '    '}
        </div>
      )}

      {mode === 'phone' && (
        <button onClick={() => logicRef.current?.sendPhone()} disabled={!isReady} className={`w-[380px] h-[58px] text-white font-black text-2xl rounded-full border-b-4 shadow-md transition-all mb-[15px] ${isReady ? 'pointer-events-auto border-[#366901] bg-gradient-to-b from-[#81c714] to-[#4c9203] cursor-pointer active:translate-y-[2px] active:border-b-2 opacity-100' : 'pointer-events-none bg-slate-300 border-slate-400 opacity-60'}`}>
          Отправить
        </button>
      )}

      <div className="w-full relative flex justify-center">
        <PinPad isDisabled={mode === 'sent'} onKeyClick={(k: string) => logicRef.current?.handleKeyPress(k)} />
        {mode === 'sent' && (
          <div className="absolute inset-x-4 top-2 bg-white border border-slate-100 rounded-[32px] shadow-2xl p-5 flex flex-col items-center gap-4 text-center z-30 pointer-events-auto">
            <div className="text-[20px] font-black text-gray-700 leading-snug px-1">Отправили смс<br />на твой номер!</div>
            <button onClick={() => logicRef.current?.goCode()} className="w-32 h-11 text-white font-black text-lg rounded-full border-b-4 border-[#366901] bg-gradient-to-b from-[#81c714] to-[#4c9203] shadow-md cursor-pointer active:translate-y-[2px] active:border-b-2">
              Ок!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
