// LoginUiManager.tsx
import { useEffect, useState } from 'react';
import React from 'react';
import { LoginButton } from './components/LoginButton';
import { LoginLoader } from './components/LoginLoader';
import loadGorizImg from '/src/assets/login_assets/load_goriz.png';
import loadVertImg from '/src/assets/login_assets/load_vert.png';
import { Scene as PhaserScene } from 'phaser';

interface LoginUiManagerProps {
  scene: PhaserScene;
  onComplete: () => void;
}

export const LoginUiManager = ({ scene, onComplete }: LoginUiManagerProps) => {
  const [view, setView] = useState<'button' | 'loader'>('button');
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
        const scaleX = (window.innerWidth * 0.90) / 460;
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

  const isScaledLsc = !isMobile && landscapeScale < 1;

  return (
    <div id="login-scene-container" className="pointer-events-none fixed inset-0 z-10 h-full w-full touch-none overflow-hidden select-none transition-opacity duration-300 ease-out">
      <img src={loadGorizImg} className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full object-fill landscape:block" alt="" />
      <img src={loadVertImg} className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full object-fill portrait:block" alt="" />

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
          style={{ top: '850px', left: '50%', transform: 'translateX(-50%)' }}
          className="pointer-events-auto absolute z-40 shrink-0"
        >
          {view === 'button' ? (
            <LoginButton onStart={() => setView('loader')} />
          ) : (
            <LoginLoader onComplete={onComplete} />
          )}
        </div>
      </div>
    </div>
  );
};
