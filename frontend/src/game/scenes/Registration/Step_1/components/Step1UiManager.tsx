import { useEffect, useState } from 'react';
import { BubbleBlock } from './BubbleBlock';
import { ConfirmSelection } from './ConfirmSelection';
import { NextButton } from './NextButton';
import { PetVideoBlock } from './PetVideoBlock';
import { SpeechInputField } from './SpeechInputField';
import { SpeechMicButton } from './SpeechMicButton';
import fonGorizImg from '/src/assets/background/fon_goriz.png';
import fonVertImg from '/src/assets/background/fon_vert.png';

export const Step1UiManager = ({ scene, onComplete }: { scene: Phaser.Scene; onComplete: () => void }) => {
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
    <div id="reg-step1-container" className="pointer-events-none fixed inset-0 z-10 h-full w-full touch-none overflow-hidden select-none transition-opacity duration-500 ease-out flex items-center justify-center">
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
          style={{ top: '40px', left: '50%', transform: 'translateX(-50%)' }}
          className="pointer-events-auto absolute z-20 shrink-0"
        >
          <BubbleBlock />
        </div>

        <div
          style={isMobile ? { top: '120px', left: '50%', transform: 'translateX(-50%)' } : { top: '160px', left: '50%', transform: 'translateX(-50%)' }}
          className="absolute z-10 shrink-0"
        >
          <PetVideoBlock />
        </div>

        <div
          style={isMobile ? { bottom: '210px', left: '50%', transform: 'translateX(-50%)' } : { bottom: '230px', left: '50%', transform: 'translateX(-50%)' }}
          className="pointer-events-auto absolute z-30 shrink-0 w-[460px] max-w-full"
        >
          <SpeechInputField scene={scene} />
        </div>

        <div
          style={{ top: '800px', left: '50%', transform: 'translateX(-50%)' }}
          className="pointer-events-auto absolute z-40 shrink-0"
        >
          <ConfirmSelection />
        </div>

        <div
          style={{ bottom: '40px', left: '50%', transform: 'translateX(-50%)' }}
          className="pointer-events-auto absolute z-40 shrink-0"
        >
          <SpeechMicButton scene={scene} />
        </div>

        <div
          style={{ top: '880px', left: '50%', transform: 'translateX(-50%)' }}
          className="pointer-events-auto absolute z-40 shrink-0"
        >
          <NextButton onComplete={onComplete} />
        </div>
      </div>
    </div>
  );
};
