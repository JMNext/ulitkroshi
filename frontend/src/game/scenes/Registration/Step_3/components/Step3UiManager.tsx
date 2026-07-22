// Step3UiManager.tsx
import { useEffect, useState } from 'react';
import React from 'react';
import { CaptchaHeaderPanel } from './CaptchaHeaderPanel';
import { CaptchaFruitGrid } from './CaptchaFruitGrid';
import { CaptchaResetButton } from './CaptchaResetButton';
import { CaptchaConfirmModal } from './CaptchaConfirmModal';
import { CaptchaBlockModal } from './CaptchaBlockModal';
import { useRegistrationStep3Store } from '../useRegistrationStep3Store';

import fonGorizImg from '/src/assets/background/fon_goriz.png';
import fonVertImg from '/src/assets/background/fon_vert.png';

interface Step3UiManagerProps {
  scene: Phaser.Scene;
  onComplete: () => void;
  onFullReset: () => void;
}

export const Step3UiManager = ({ scene, onComplete, onFullReset }: Step3UiManagerProps) => {
  const mode = useRegistrationStep3Store(s => s.mode);
  const attempts = useRegistrationStep3Store(s => s.attempts);
  const toggleSelect = useRegistrationStep3Store(s => s.toggleSelect);
  const setCaptchaState = useRegistrationStep3Store(s => s.setCaptchaState);
  
  const [isMobile, setIsMobile] = useState(false);
  const [landscapeScale, setLandscapeScale] = useState(1);
  const [portraitScale, setPortraitScale] = useState(1);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsMobile(isPortrait);
      if (!isPortrait) {
        setLandscapeScale(window.innerHeight < 1000 ? Math.min(window.innerWidth / 1920, window.innerHeight / 1080) : 1);
      } else {
        const scaleX = (window.innerWidth * 0.90) / 540;
        const scaleY = (window.innerHeight * 0.92) / 1020;
        setPortraitScale(Math.min(Math.min(scaleX, scaleY), 1));
      }
    };

    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 50);
    };

    handleResize();
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    let currentSel: unknown[] = useRegistrationStep3Store.getState().sel;
    const unsub = useRegistrationStep3Store.subscribe((state) => {
      if (state.mode === 'verify' && state.sel.length === 4 && !state.isSubmitting && state.sel !== currentSel) {
        currentSel = state.sel;
        state.verifyAndSubmit(state.sel).then(() => {
          if (!useRegistrationStep3Store.getState().errorMessage) onComplete();
        });
      }
    });
    return () => unsub();
  }, [onComplete]);

  const isScaledLsc = !isMobile && landscapeScale < 1;

  return (
    <div id="reg-step3-container" className="pointer-events-none fixed inset-0 z-10 h-full w-full touch-none overflow-hidden select-none transition-opacity duration-500 ease-out">
      <img src={fonGorizImg} className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full object-fill landscape:block" alt="" />
      <img src={fonVertImg} className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full object-fill portrait:block" alt="" />

      <div 
        style={isMobile ? {
          transform: `translate(-50%, -50%) scale(${portraitScale})`, 
          transformOrigin: 'center center', top: '50%', left: '50%',
          width: '100%', height: '1020px', position: 'absolute'
        } : isScaledLsc ? {
          transform: `translate(-50%, -50%) scale(${landscapeScale})`, 
          transformOrigin: 'center center', top: '50%', left: '50%',
          width: '1920px', height: '1080px', position: 'absolute'
        } : {
          position: 'relative', width: '100%', height: '100%', transform: 'none'
        }}
        className="pointer-events-none max-w-[1920px] max-h-[1080px]"
      >
        <div
          style={{ top: '60px', left: '50%', transform: 'translateX(-50%)' }}
          className="pointer-events-auto absolute z-20 shrink-0"
        >
          <CaptchaHeaderPanel />
        </div>

        <div
          style={{ top: '340px', left: '50%', transform: 'translateX(-50%)' }}
          className="pointer-events-auto absolute z-40 shrink-0"
        >
          <div className="relative w-full h-full">
            <CaptchaFruitGrid onPress={toggleSelect} />
            {attempts >= 3 && <CaptchaBlockModal onReset={onFullReset} />}
          </div>
        </div>

        <div
          style={{ top: '860px', left: '50%', transform: 'translateX(-50%)' }}
          className="pointer-events-auto absolute z-40 shrink-0"
        >
          <CaptchaResetButton onReset={onFullReset} />
        </div>
      </div>

      {mode === 'confirm' && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-transparent">
          <CaptchaConfirmModal
            onConfirm={() => setCaptchaState([], useRegistrationStep3Store.getState().sel, 'verify', false)}
          />
        </div>
      )}
    </div>
  );
};
