import { useEffect, useState, useMemo, useCallback } from 'react';
import React from 'react';
import { BottomMenu } from './MainBottomMenu/BottomMenu'; 
import { PetCharacter } from './PetCharacter/PetCharacter';
import { MainHeaderUI } from './MainHeader/HeaderUI';
import { SideButtonsMenu } from './MainSideButtons/SideButtonsMenu';
import { PetHealthBar } from './PetHealthBar/PetHealthBar';
import { ProfileEditUI } from './ProfileEdit/ProfileEditUI';
import { ShopModal } from './ShopModal/ShopModal';
import { PetsModal } from './PetsModal/PetsModal';
import { MinigameModal } from '../../../ui/components/MinigameModal/MinigameModal';
import fotoIcon from '../../../assets/interface-icons/foto.svg';
import minigameIcon from '../../../assets/interface-icons/mini-game.svg';
import mypetsIcon from '../../../assets/interface-icons/my-pets.svg'; 
import shopIcon from '../../../assets/interface-icons/shop.svg';
import fonGorizImg from '/src/assets/background/fon_goriz.png';
import fonVertImg from '/src/assets/background/fon_vert.png';

export const MODAL_OVERLAY_CLASS = "fixed inset-0 z-50 flex h-full w-full select-none items-center justify-center bg-black/40 p-4 pointer-events-auto backdrop-blur-sm";

export const MainUiManager = ({ scene }: { scene: Phaser.Scene }) => {
  const [modal, setModal] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [landscapeScale, setLandscapeScale] = useState(1);
  const [portraitScale, setPortraitScale] = useState(1);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [screenType, setScreenType] = useState<'desktop' | 'square' | 'portrait' | 'lowLandscape'>('desktop');

  const handleResize = useCallback(() => {
    const w = window.innerWidth, h = window.innerHeight;
    const isPortrait = h > w;
    setIsMobile(isPortrait);
    setWindowWidth(w);

    if (Math.abs(w - h) < 10) setScreenType('square');
    else if (isPortrait && w / h <= 0.75) setScreenType('portrait');
    else if (!isPortrait && h < 550) setScreenType('lowLandscape'); 
    else setScreenType('desktop');

    if (!isPortrait) {
      setLandscapeScale(h < 1000 ? Math.min(w / 1920, h / 1080) : 1);
    } else {
      setPortraitScale(h < 880 ? (h / 880) * 0.95 : 1);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    let timeoutId: ReturnType<typeof setTimeout>;

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
  }, [handleResize]);

  const leftButtons = useMemo(() => [
    { icon: 'shop', src: shopIcon, id: 'ui_open_shop' },
    { icon: 'foto', src: fotoIcon, id: 'ui_take_screenshot' }
  ], []);

  const rightButtons = useMemo(() => [
    { icon: 'minigame', src: minigameIcon, id: 'ui_open_minigame' },
    { icon: 'mypets', src: mypetsIcon, id: 'ui_open_pets' }
  ], []);

  const currentModalWidth = useMemo(() => {
    if (!isMobile && modal === 'shop') return 800;
    if (isMobile && modal === 'shop') return 440;
    if (modal === 'pets') return 480;
    if (modal === 'minigame') return 440;
    if (modal === 'profile') return 500;
    return 480;
  }, [modal, isMobile]);

  const availableWidth = windowWidth - 32;
  const isScaledPrt = isMobile && currentModalWidth > availableWidth;
  const portraitModalScale = isScaledPrt ? availableWidth / currentModalWidth : 1;

  const isScaledLsc = !isMobile && landscapeScale < 1;
  
  const modalScaleStyle = useMemo(() => {
    if (screenType === 'lowLandscape') {
      return { transform: `scale(${Math.max(landscapeScale * 1.25, 0.85)})`, transformOrigin: 'center center' };
    }
    return isScaledLsc 
      ? { transform: `scale(${landscapeScale})` } 
      : isScaledPrt 
        ? { transform: `scale(${portraitModalScale})`, transformOrigin: 'center center' } 
        : {};
  }, [screenType, isScaledLsc, landscapeScale, isScaledPrt, portraitModalScale]);

  const handleStartMinigame = useCallback((key: string, difficulty: string) => {
    setModal(null);
    scene.events.emit('start_minigame_transition', { key, difficulty });
  }, [scene]);

  return (
    <div id="main-scene-container" className="fixed inset-0 w-full h-full overflow-hidden touch-none pointer-events-none z-10 select-none transition-opacity duration-500 ease-out">
      <img src={fonGorizImg} className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0 hidden landscape:block" alt="" />
      <img src={fonVertImg} className="absolute inset-0 w-full h-full object-fill pointer-events-none z-0 hidden portrait:block" alt="" />

      <div
        style={isScaledLsc ? {
          transform: `translateX(-50%) scale(${landscapeScale})`,
          transformOrigin: 'bottom center', bottom: '0px', left: '50%',
          width: '1920px', height: '1080px', position: 'absolute'
        } : {
          position: 'relative', width: '100%', height: '100%', transform: 'none'
        }}
        className="pointer-events-none max-w-[1920px] max-h-[1080px]"
      >
        <div style={isMobile ? { top: '25px', left: '0px', width: '100%', paddingLeft: '20px', paddingRight: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } : { top: '50px', left: '60px', right: '60px', width: 'auto', display: 'block' }} className="absolute z-25 pointer-events-auto">
          <MainHeaderUI onPlusClick={() => setModal('shop')} onAvatarClick={() => setModal('profile')} />
        </div>

        <div style={{ top: isMobile ? `${220 * portraitScale}px` : '100px', left: '50%', transform: isMobile ? `translateX(-50%) scale(${0.75 * portraitScale})` : 'translateX(-50%)', transformOrigin: 'top center' }} className="absolute z-20 pointer-events-auto">
          <PetHealthBar />
        </div>

        <div style={{ bottom: isMobile ? `${220 * portraitScale}px` : (isScaledLsc ? '330px' : '220px'), left: '50%', transform: isMobile ? `translateX(-50%) scale(${0.76 * portraitScale})` : 'translateX(-50%)', transformOrigin: 'bottom center' }} className="absolute z-10 pointer-events-auto">
          <PetCharacter onAnimationComplete={(anim) => scene.events.emit('pet_animation_complete', anim)} />
        </div>

        <div style={{ top: isMobile ? `${310 * portraitScale}px` : '350px', left: isMobile ? '10px' : '540px', transform: isMobile ? `scale(${0.7 * portraitScale})` : 'none', transformOrigin: 'left center' }} className="absolute z-30 pointer-events-auto">
          <SideButtonsMenu buttons={leftButtons} onAction={(id) => id === 'ui_open_shop' ? setModal('shop') : scene.events.emit(id)} />
        </div>

        <div style={{ top: isMobile ? `${310 * portraitScale}px` : '350px', right: isMobile ? '20px' : '540px', transform: isMobile ? `scale(${0.7 * portraitScale})` : 'none', transformOrigin: 'right center' }} className="absolute z-30 pointer-events-auto">
          <SideButtonsMenu buttons={rightButtons} onAction={(id) => id === 'ui_open_minigame' ? setModal('minigame') : id === 'ui_open_pets' ? setModal('pets') : scene.events.emit(id)} />
        </div>

        <div style={{ bottom: '0px', left: '50%', transform: 'translateX(-50%)' }} className="absolute left-1/2 z-40 pointer-events-auto w-[1080px] h-auto overflow-hidden flex justify-center items-end">
          <div className="relative flex justify-center w-[1080px] h-auto shrink-0">
            <BottomMenu scene={scene} />
          </div>
        </div>
      </div>

      {modal && (
        <div className={MODAL_OVERLAY_CLASS} onClick={() => setModal(null)}>
          <div 
            style={modalScaleStyle} 
            className="pointer-events-auto max-w-[calc(100vw-32px)] px-2" 
            onClick={(e) => e.stopPropagation()} 
          >
            {modal === 'profile' && <ProfileEditUI onClose={() => setModal(null)} onAddPetClick={() => setModal('pets')} />}
            {modal === 'shop' && <ShopModal onClose={() => setModal(null)} />}
            {modal === 'pets' && <PetsModal onClose={() => setModal(null)} />}
            {modal === 'minigame' && (
              <MinigameModal 
                onClose={() => setModal(null)} 
                onStartGame={handleStartMinigame} 
                screenType={screenType}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
