import React, { useState, useEffect, useRef } from 'react';
import { RegistrationLogic_Step1 } from './RegistrationLogic_Step1';
import { _internalRegBridge, destroyRegistrationUI_Step1 } from './RegistrationUI_Step1';
import { SpeechMicButton } from './SpeechMicButton';

interface Props {
  scene: any;
  onComplete: () => void;
}

export const RegistrationUIComponent: React.FC<Props> = ({ scene, onComplete }) => {
  const [stage, setStage] = useState(1);
  const [name, setName] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  const logicRef = useRef<RegistrationLogic_Step1 | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    logicRef.current = new RegistrationLogic_Step1(scene);
    _internalRegBridge.register(setStage, setName, () => {}); // Нам больше не нужно передавать setIsListening наружу

    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (logicRef.current) {
        logicRef.current.destroy();
      }
      _internalRegBridge.unregister();
    };
  }, [scene]);

  useEffect(() => {
    if ((stage === 1 || stage === 3) && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Обработчики для "умной" кнопки микрофона
  const handleSpeechResult = (recognizedName: string) => {
    setInputValue('');
    logicRef.current?.handleInputSubmit(recognizedName);
  };

  const handleSpeechError = () => {
    logicRef.current?.handleConfirmNo(); // Переключаем на стадию 3 (не расслышал) через логику
  };

  const isPortrait = dimensions.width < dimensions.height;
  const uiScale = isPortrait ? 0.75 : 1.0;

  const styleConfig = {
    bubble: { transform: `scale(${uiScale})`, transformOrigin: 'top center' },
    petVideo: { transform: `translate(-50%, -50%) scale(${uiScale})`, transformOrigin: 'center center' },
    bottomControls: { transform: `translateX(-50%) scale(${uiScale})`, transformOrigin: 'bottom center' }
  };

  return (
    <div className="fixed inset-0 pointer-events-none w-full h-[100vh] z-30 flex justify-center overflow-hidden">
      {/* Текстовое облачко с диалогом */}
      <div 
        style={styleConfig.bubble} 
        className="absolute top-[4%] pointer-events-auto bg-white/95 backdrop-blur-sm rounded-[32px] px-10 py-5 text-center shadow-xl max-w-lg w-[45vw] min-w-[320px] z-20 box-border"
      >
        {stage === 1 && (
          <div className="text-[17px] font-bold text-slate-800 leading-snug tracking-wide">
            Привет, друг! Я — твой Улиткрош! Придумай мне имя, а затем введи его на клавиатуре или нажми на большую красную кнопку и скажи мне его. Громко и чётче!
          </div>
        )}
        {stage === 2 && (
          <div className="text-2xl font-bold text-slate-700 leading-normal">
            <p className="text-lg text-slate-500 font-medium">Меня зовут</p>
            <p className="text-4xl font-black text-emerald-800 mt-0.5">{name}?</p>
          </div>
        )}
        {stage === 3 && (
          <div className="text-xl font-bold text-slate-800 leading-snug space-y-1">
            <p>Ой, я не расслышал!</p>
            <p>Давай ещё разок, громче и чётче!</p>
          </div>
        )}
        {stage === 4 && (
          <div className="text-2xl font-bold text-slate-700 leading-normal">
            <p className="text-lg text-slate-500 font-medium">Здорово, теперь меня зовут</p>
            <p className="text-4xl font-black text-emerald-800 mt-0.5">{name}</p>
          </div>
        )}
        <div className="absolute bottom-[-12px] left-[45%] w-0 h-0 border-x-[12px] border-x-transparent border-t-[12px] border-t-white/95" />
      </div>

      {/* Анимация питомца */}
      <div style={styleConfig.petVideo} className="absolute top-[42%] left-1/2 w-[644px] h-[644px] pointer-events-none z-10">
        <video src="/assets/resources/1stpet-animation/prostoi-converted.webm" muted playsInline autoPlay loop className="w-full h-full object-contain drop-shadow-md" />
      </div>

      {/* Панель управления */}
      <div style={styleConfig.bottomControls} className="absolute bottom-[40px] left-1/2 flex flex-col items-center z-25">
        
        {/* СТАДИЯ 1 ИЛИ 3: Ввод имени */}
        {(stage === 1 || stage === 3) && (
          <div className="flex flex-col items-center gap-[12px] w-full max-w-sm">
            <input
              ref={inputRef}
              type="text"
              placeholder="Как меня зовут?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter') {
                  inputRef.current?.blur();
                  logicRef.current?.handleInputSubmit(inputValue); 
                }
              }}
              className="pointer-events-auto w-[360px] h-[64px] bg-white text-center text-2xl font-bold rounded-full shadow-lg border border-slate-100 outline-none text-emerald-800 placeholder-slate-400 focus:border-emerald-500 transition-colors"
            />
            
            {/* Автономная кнопка микрофона со встроенной логикой */}
            <SpeechMicButton 
              onSpeechResult={handleSpeechResult} 
              onSpeechError={handleSpeechError} 
            />
          </div>
        )}

        {/* СТАДИЯ 2: Подтверждение выбора */}
        {stage === 2 && (
          <div className="pointer-events-auto bg-white rounded-[24px] p-2 flex gap-4 shadow-lg w-[420px] h-[76px] border-2 border-[#81c714] items-center justify-between box-border">
            <button 
              onClick={() => logicRef.current?.handleConfirmNo()} 
              className="flex-1 h-full bg-gradient-to-b from-[#ff5252] to-[#e63254] hover:from-[#ff6e6e] hover:to-[#e63254] active:scale-95 font-black text-white text-2xl rounded-[18px] shadow-sm transition-transform cursor-pointer flex items-center justify-center select-none"
            >
              Нет
            </button>
            <button 
              onClick={() => logicRef.current?.handleConfirmYes()} 
              className="flex-1 h-full bg-gradient-to-b from-[#81c714] to-[#60aa05] hover:from-[#92d623] hover:to-[#60aa05] active:scale-95 font-black text-white text-2xl rounded-[18px] shadow-sm transition-transform cursor-pointer flex items-center justify-center select-none"
            >
              Да!
            </button>
          </div>
        )}

        {/* СТАДИЯ 4: Успешное завершение */}
        {stage === 4 && (
          <button 
            onClick={() => { destroyRegistrationUI_Step1(); onComplete(); }} 
            className="pointer-events-auto active:scale-90 transition-transform cursor-pointer flex items-center justify-center w-[180px] h-[180px]"
          >
            <img src="/assets/registration/next_button.png" className="w-full h-full object-contain" alt="далее" />
          </button>
        )}
      </div>
    </div>
  );
};
