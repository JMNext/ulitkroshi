import React, { useState, useEffect, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import Phaser from 'phaser';
import begemotImg from '../../../assets/login_assets/begemot.png';

let loginUiRoot: Root | null = null;
let globalStartLoading: ((onComplete: () => void) => void) | null = null;

export const renderLoginUI = (scene: Phaser.Scene, onStartClick: () => void): void => {
  destroyLoginUI();
  const container = document.createElement('div');
  container.id = 'login-ui-overlay';
  container.className = 'absolute inset-0 pointer-events-none z-30';
  document.getElementById('game-container')?.appendChild(container);

  loginUiRoot = createRoot(container);
  loginUiRoot.render(<LoginUIComponent scene={scene} onStart={onStartClick} />);
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

const LoginUIComponent = ({ scene, onStart }: { scene: Phaser.Scene; onStart: () => void }) => {
  const [step, setStep] = useState<'button' | 'loading'>('button');
  const [progress, setProgress] = useState(0);
  const [dims, setDims] = useState({ width: scene.scale.width, height: scene.scale.height });
  const onCompleteRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleResize = () => setDims({ width: scene.scale.width, height: scene.scale.height });
    scene.scale.on('resize', handleResize);

    globalStartLoading = (onComplete) => {
      onCompleteRef.current = onComplete;
      setStep('loading');
    };

    return () => {
      scene.scale.off('resize', handleResize);
      globalStartLoading = null;
    };
  }, [scene]);

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
  const isLandscapeTablet = !isPortrait && (dims.width / dims.height) < 1.72;
  const isUltraNarrow = isPortrait && (dims.width / dims.height) < 0.5;

  let uiScale = 1.0;
  if (isUltraNarrow) {
    uiScale = Math.min(dims.width / 390, 0.85);
  } else if (isPortrait) {
    uiScale = 0.8;
  } else if (isLandscapeTablet) {
    uiScale = 0.75;
  }

  let bottomOffset = '80px';
  if (isLandscapeTablet) {
    bottomOffset = '45px';
  } else if (isUltraNarrow) {
    bottomOffset = '95px';
  }

  const bottomControlsStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    bottom: bottomOffset,
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
          className="pointer-events-auto w-[280px] h-[76px] flex items-center justify-center text-[28px] font-black text-white uppercase tracking-wider cursor-pointer rounded-[38px] border-t-2 border-b-0 border-x-0 border-[#a6f034] bg-gradient-to-b from-[#81c714] to-[#4c9203] shadow-[0_6px_0_0_#366901,0_10px_16px_rgba(0,0,0,0.45)] active:translate-y-[3px] active:shadow-[0_2px_0_0_#366901,0_4px_6px_rgba(0,0,0,0.4)] transition-all duration-75 select-none"
        >
          ВОЙТИ
        </button>
      )}

      {step === 'loading' && (
        <div 
          style={bottomControlsStyle}
          className="w-[85vw] max-w-[380px] h-[36px] bg-white/95 rounded-full p-1 border border-slate-200/30 shadow-xl flex items-center pointer-events-auto select-none box-border"
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
              className="w-[42px] h-[42px] flex items-center justify-center z-10"
            >
              <img
                src={begemotImg}
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
