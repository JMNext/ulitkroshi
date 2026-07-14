import React, { useState, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { renderProfileEditUI } from './ProfileEditUI';

let headerRoot: Root | null = null;
const CONTAINER_ID = 'main-header-ui-overlay';

export const renderMainHeaderUI = (scene: any): void => {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.getElementById('game-container')?.appendChild(container);
  }
  if (!headerRoot && container) {
    headerRoot = createRoot(container);
  }
  headerRoot?.render(<MainHeaderComponent scene={scene} />);
};

export const destroyMainHeaderUI = (): void => {
  if (headerRoot) {
    headerRoot.unmount();
    headerRoot = null;
  }
  document.getElementById(CONTAINER_ID)?.remove();
};

const MainHeaderComponent = ({ scene }: { scene: any }) => {
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAvatarClick = () => {
    if (scene.krosh?.isTransitioning || scene.krosh?.isSleeping) return;
    if (scene && typeof scene.updateHealthBarPosition === 'function') {
      scene.updateHealthBarPosition('hidden');
    }
    renderProfileEditUI(scene);
  };

  const isMobilePhone = dims.width < 550;
  const uiScale = isMobilePhone ? 0.5 : 1.0;
  const leftPos = isMobilePhone ? 16 : 65;
  const rightPos = isMobilePhone ? 16 : 65;
  const topPos = isMobilePhone ? 16 : 45;

  const coinsStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${topPos}px`,
    left: `${leftPos}px`,
    transform: `scale(${uiScale})`,
    transformOrigin: 'top left',
  };

  const avatarStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${topPos}px`,
    right: `${rightPos}px`,
    transform: `scale(${uiScale})`,
    transformOrigin: 'top right',
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-30">
      <div style={coinsStyle}>
        <div className="pointer-events-auto relative min-w-[160px] max-w-[240px] h-[70px] bg-white rounded-[35px] flex items-center justify-between shadow-[0_10px_15px_rgba(0,0,0,0.06)] border border-slate-100 pl-[15px] pr-[75px]">
          <img src="/assets/buttom_menu-icons/eat.svg" className="w-[60px] h-[60px] shrink-0" alt="coin" />
          <span className="text-[#1a3d1c] font-bold text-2xl flex-1 text-center leading-none px-2 select-none">0</span>
          <img src="/assets/interface-icons/plus.svg" className="absolute right-[12px] w-[50px] h-[50px] cursor-pointer transition-transform active:scale-90" alt="plus" />
        </div>
      </div>
      <div style={avatarStyle}>
        <div className="pointer-events-auto w-[100px] h-[100px] cursor-pointer transition-transform active:scale-95" onClick={handleAvatarClick}>
          <img src="/assets/interface-icons/icon-avatar.svg" className="w-full h-full rounded-full shadow-md object-cover" alt="avatar" />
        </div>
      </div>
    </div>
  );
};
