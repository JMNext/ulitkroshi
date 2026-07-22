import { useEffect, useState } from 'react';
import { HeaderBlock } from './HeaderBlock';
import { DisplayFields } from './DisplayFields';
import { SubmitButton } from './SubmitButton';
import { PinPad } from './PinPad';
import { SentModal } from './SentModal';
import { useRegistrationStep2Store } from '../useRegistrationStep2Store';
import fonGorizImg from '/src/assets/background/fon_goriz.png';
import fonVertImg from '/src/assets/background/fon_vert.png';

export const Step2UiManager = ({ onComplete }: { onComplete: (sid: string) => void }) => {
  const mode = useRegistrationStep2Store((s) => s.mode);
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
        setPortraitScale(Math.min(scaleX, scaleY, 1));
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

  const isScaledLsc = !isMobile && landscapeScale < 1;

  return (
    <div id="reg-step2-container" className="pointer-events-none fixed inset-0 z-10 h-full w-full touch-none overflow-hidden select-none transition-opacity duration-500 ease-out flex items-center justify-center">
      <img src={fonGorizImg} className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full object-fill landscape:block" alt="" />
      <img src={fonVertImg} className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full object-fill portrait:block" alt="" />

      <div 
        style={isMobile ? {
          transform: `scale(${portraitScale})`, 
          transformOrigin: 'center center',
          width: '540px', height: '1020px', position: 'relative'
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
          <HeaderBlock />
        </div>
        
        <div
          style={{ top: '240px', left: '50%', transform: 'translateX(-50%)' }}
          className="pointer-events-auto absolute z-20 shrink-0"
        >
          <DisplayFields />
        </div>
        
        {mode === 'phone' && (
          <div
            style={{ top: '380px', left: '50%', transform: 'translateX(-50%)' }}
            className="pointer-events-auto absolute z-40 shrink-0"
          >
            <SubmitButton />
          </div>
        )}

        <div
          style={{ 
            top: mode === 'code' ? '400px' : '520px', 
            left: '50%', 
            transform: 'translateX(-50%)' 
          }}
          className="pointer-events-auto absolute z-40 shrink-0 transition-all duration-200 ease-out"
        >
          <PinPad onSuccessCode={onComplete} />
        </div>

        {mode === 'sent' && (
          <div
            style={{ top: '510px', left: '50%', transform: 'translate(-50%, -50%)' }}
            className="pointer-events-auto absolute z-50 shrink-0"
          >
            <SentModal />
          </div>
        )}
      </div>
    </div>
  );
};
