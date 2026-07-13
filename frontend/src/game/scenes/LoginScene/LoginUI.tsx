import React, { useState, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';

let loginUiRoot: Root | null = null;
let globalStartLoading: ((onComplete: () => void) => void) | null = null;

export const renderLoginUI = (scene: any, onStartClick: () => void): void => {
  destroyLoginUI();
  const container = document.createElement('div');
  container.id = 'login-ui-overlay';
  container.className = 'absolute inset-0 pointer-events-none z-30';
  document.getElementById('game-container')?.appendChild(container);

  loginUiRoot = createRoot(container);
  loginUiRoot.render(<LoginUIComponent onStart={onStartClick} />);
};

export const destroyLoginUI = (): void => {
  if (loginUiRoot) { 
    loginUiRoot.unmount(); 
    loginUiRoot = null; 
  }
  document.getElementById('login-ui-overlay')?.remove();
  globalStartLoading = null;
};

export const startLoadingAnimation = (onComplete: () => void): void => {
  if (globalStartLoading) globalStartLoading(onComplete);
};

const LoginUIComponent = ({ onStart }: { onStart: () => void }) => {
  const [step, setStep] = useState<'button' | 'loading'>('button');
  const [progress, setProgress] = useState(0);
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });
  const onCompleteRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleResize = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);

    globalStartLoading = (onComplete) => {
      onCompleteRef.current = onComplete;
      setStep('loading');
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      globalStartLoading = null;
    };
  }, []);

  useEffect(() => {
    if (step !== 'loading') return;
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress = Math.min(currentProgress + 0.015, 1);
      setProgress(currentProgress);

      if (currentProgress >= 1) {
        clearInterval(interval);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [step]);

  const isPortrait = dims.width < dims.height;
  const uiScale = isPortrait ? 0.75 : 1.0;

  const bottomControlsStyle: React.CSSProperties = {
    transform: `translateX(-50%) scale(${uiScale})`,
    transformOrigin: 'bottom center',
  };

  const begemotRotation = Math.sin(progress * 30) * 6;

  return (
    <div className="fixed inset-0 pointer-events-none w-full h-full overflow-hidden">
      {step === 'button' && (
        <button
          onClick={onStart}
          style={bottomControlsStyle}
          className="absolute bottom-[12%] portrait:bottom-[110px] left-1/2 pointer-events-auto w-[50vw] h-[20vw] max-w-[200px] max-h-[80px] leading-[20vw] sm:leading-[80px] text-[6vw] sm:text-[22px] text-center font-black text-white uppercase tracking-wider cursor-pointer rounded-[10vw] sm:rounded-[40px] border-t-2 border-b-0 border-x-0 border-[#a6f034] bg-gradient-to-b from-[#81c714] to-[#4c9203] shadow-[0_5px_0_0_#366901,0_8px_12px_rgba(0,0,0,0.4)] active:translate-y-[3px] active:shadow-[0_2px_0_0_#366901,0_4px_6px_rgba(0,0,0,0.4)] transition-all duration-75 select-none"
        >
          ВОЙТИ
        </button>
      )}

      {step === 'loading' && (
        <div 
          style={bottomControlsStyle}
          className="absolute bottom-[12%] portrait:bottom-[110px] left-1/2 w-[80vw] max-w-[400px] h-[40px] bg-white/95 rounded-full p-1 border border-slate-200/30 shadow-xl flex items-center pointer-events-auto select-none box-border"
        >
          <div className="w-full h-full bg-[#ede9e6] rounded-full p-[3px] relative overflow-visible flex items-center">
            <div
              style={{ width: `${progress * 100}%` }}
              className="h-full bg-[#f9b300] rounded-full transition-all duration-75 ease-out"
            />
            <div
              style={{
                position: 'absolute',
                left: `${progress * 100}%`,
                transform: `translateX(-50%) rotate(${begemotRotation}deg)`,
                transition: 'left 75ms ease-out',
              }}
              className="w-[50px] h-[50px] flex items-center justify-center z-10"
            >
              <img
                src="/assets/login_assets/begemot.png"
                className="w-full h-full object-contain drop-shadow-md"
                alt="begemot"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
