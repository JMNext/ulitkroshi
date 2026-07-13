import React, { useState, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MainScene } from './MainScene';
import { startFeedingDrag, startPlayingDrag, startWashingDrag } from './PetCareActions';

let bottomRoot: Root | null = null;
const MENU_CONFIG = {
  containerId: 'main-bottom-ui-overlay',
  maxWidth: 'max-w-[1200px]',
};

export const renderMainBottomMenuUI = (scene: MainScene): void => {
  let container = document.getElementById(MENU_CONFIG.containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = MENU_CONFIG.containerId;
    document.getElementById('game-container')?.appendChild(container);
  }
  if (!bottomRoot && container) bottomRoot = createRoot(container);
  bottomRoot?.render(<MainBottomMenuComponent scene={scene} />);
};

export const destroyMainBottomMenuUI = (): void => {
  if (bottomRoot) {
    bottomRoot.unmount();
    bottomRoot = null;
  }
  document.getElementById(MENU_CONFIG.containerId)?.remove();
};

const MainBottomMenuComponent = ({ scene }: { scene: MainScene }) => {
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAction = (text: string, action: () => void) => {
    if (scene.krosh?.isTransitioning) return;
    if (scene.krosh?.isSleeping && text !== 'Спать') return;
    action();
  };

  const menuItems = [
    { text: 'Кормить', icon: '/assets/buttom_menu-icons/eat.svg', action: (e: any) => startFeedingDrag(scene, e) },
    { text: 'Мыть', icon: '/assets/buttom_menu-icons/wash.svg', action: (e: any) => startWashingDrag(scene, e) },
    { text: 'Играть', icon: '/assets/buttom_menu-icons/play.svg', action: (e: any) => startPlayingDrag(scene, e) },
    { text: 'Спать', icon: '/assets/buttom_menu-icons/sleep.svg', action: () => scene.krosh?.playAnim('sleep', true) },
  ];

  const isPortrait = dims.width < dims.height;
  const menuScale = isPortrait ? Math.max(0.42, dims.width / 750) : Math.min(1.0, dims.width / 1400);

  const mainWrapperStyle: React.CSSProperties = {
    position: 'fixed',
    left: '50%',
    bottom: '0',
    width: '1920px',
    height: '260px',
    zIndex: 10,
    transform: `translateX(-50%) scale(${menuScale})`,
    transformOrigin: 'bottom center',
  };

  const bgImageStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '1920px',
    height: '260px',
    objectFit: 'none',
    objectPosition: 'bottom center',
    pointerEvents: 'none',
    userSelect: 'none',
    zIndex: 0,
  };

  const buttonsWrapperStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    display: 'flex',
    width: isPortrait ? '560px' : '1200px',
    justifyContent: 'center',
    alignItems: 'end',
    gap: isPortrait ? '20px' : '36px',
    paddingBottom: '40px',
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div style={mainWrapperStyle} className="pointer-events-auto">
        <img src="/assets/background/bottom-menu-desktop.svg" style={bgImageStyle} alt="menu-bg" />
        <div style={buttonsWrapperStyle}>
          {menuItems.map((item) => (
            <div
              key={item.text}
              onMouseDown={(e) => { e.preventDefault(); handleAction(item.text, () => item.action(e)); }}
              onTouchStart={(e) => handleAction(item.text, () => item.action(e))}
              className="flex flex-col items-center cursor-pointer transition-transform duration-75 active:scale-95 w-[115px]"
            >
              <div className="relative w-[115px] h-[115px] flex items-center justify-center">
                <img src="/assets/buttom_menu-icons/button.svg" className="absolute inset-0 w-full h-full" alt="btn-bg" />
                <img src={item.icon} className="relative w-[75px] h-[75px] z-10" alt={item.text} />
              </div>
              <span className="text-[24px] font-bold text-[#424242] mt-1 leading-none tracking-wide select-none block text-center w-full">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
