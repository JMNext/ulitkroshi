import { useEffect, useState } from 'react';
import { SuccessBubble } from './SuccessBubble';
import { HappyPetVideo } from './HappyPetVideo';
import { FinalPlayButton } from './FinalPlayButton';
import fonGorizImg from '/src/assets/background/fon_goriz.png';
import fonVertImg from '/src/assets/background/fon_vert.png';

export const Step4UiManager = ({ onPlayComplete }: { onPlayComplete: () => void }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [landscapeScale, setLandscapeScale] = useState(1);
  const [portraitScale, setPortraitScale] = useState(1);

  useEffect(() => {
    document.body.style.overflow = 'hidden'; let tId: ReturnType<typeof setTimeout>;
    const hResize = () => {
      const isP = window.innerHeight > window.innerWidth; setIsMobile(isP);
      if (!isP) setLandscapeScale(window.innerHeight < 1000 ? Math.min(window.innerWidth / 1920, window.innerHeight / 1080) : 1);
      else setPortraitScale(Math.min((window.innerWidth * 0.85) / 460, (window.innerHeight * 0.92) / 1020, 1));
    };
    const dResize = () => { clearTimeout(tId); tId = setTimeout(hResize, 50); };
    hResize(); window.addEventListener('resize', dResize);
    return () => { window.removeEventListener('resize', dResize); clearTimeout(tId); };
  }, []);

  const isScaledLsc = !isMobile && landscapeScale < 1;

  return (
    <div id="reg-step4-container" className="pointer-events-none fixed inset-0 z-10 h-full w-full touch-none overflow-hidden select-none transition-opacity duration-500 ease-out flex items-center justify-center">
      <img src={fonGorizImg} className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full object-fill landscape:block" alt="" />
      <img src={fonVertImg} className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full object-fill portrait:block" alt="" />
      <div 
        style={isMobile ? { transform: `scale(${portraitScale})`, transformOrigin: 'center center', width: '460px', height: '1020px', position: 'relative' } : isScaledLsc ? { transform: `translate(-50%, -50%) scale(${landscapeScale})`, transformOrigin: 'center center', top: '50%', left: '50%', width: '1920px', height: '1080px', position: 'absolute' } : { position: 'relative', width: '100%', height: '100%', transform: 'none' }}
        className="pointer-events-none max-w-[1920px] max-h-[1080px]"
      >
        <div style={{ top: '40px', left: '50%', transform: 'translateX(-50%)' }} className="pointer-events-auto absolute z-20 shrink-0"><SuccessBubble /></div>
        <div style={isMobile ? { top: '120px', left: '50%', transform: 'translateX(-50%)' } : { top: '160px', left: '50%', transform: 'translateX(-50%)' }} className="absolute z-10 shrink-0"><HappyPetVideo /></div>
        <div style={{ top: '830px', left: '50%', transform: 'translateX(-50%)' }} className="pointer-events-auto absolute z-50 shrink-0"><FinalPlayButton onClick={onPlayComplete} /></div>
      </div>
    </div>
  );
};
