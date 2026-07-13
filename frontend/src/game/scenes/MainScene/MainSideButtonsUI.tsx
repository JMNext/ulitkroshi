import React, { useState, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { showMinigameModal } from '../../../ui/components/MinigameModal'; 
import { showShopModal } from './ShopModal';
import { showPetsModal } from './PetsModal';
import { takeScreenshot } from './takeScreenshot';

let sideRoot: Root | null = null;
const CONTAINER_ID = 'main-side-ui-overlay';

export function renderMainSideButtonsUI(scene: any): void {
  let container = document.getElementById(CONTAINER_ID) || document.createElement('div');
  if (!container.id) {
    container.id = CONTAINER_ID;
    document.getElementById('game-container')?.appendChild(container);
  }
  if (!sideRoot) sideRoot = createRoot(container);
  sideRoot.render(<MainSideButtonsComponent scene={scene} />);
}

export function destroyMainSideButtonsUI(): void {
  if (sideRoot) { sideRoot.unmount(); sideRoot = null; }
  document.getElementById(CONTAINER_ID)?.remove();
}

function MainSideButtonsComponent({ scene }: { scene: any }) {
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAction = (action: () => void) => {
    if (!scene.krosh?.isTransitioning && !scene.krosh?.isSleeping) action();
  };

  const leftButtons = [
    { icon: 'shop', click: () => showShopModal() },
    { icon: 'foto', click: () => takeScreenshot(scene) }
  ];

  const rightButtons = [
    { icon: 'mini-game', click: () => showMinigameModal(scene) },
    { icon: 'my-pets', click: () => showPetsModal() }
  ];

  const isPortrait = dims.width < dims.height;
  const isMobilePhone = dims.width < 550;
  const uiScale = isMobilePhone ? 0.5 : 1.0;

  // Точный расчет игрового поля Phaser
  const gridW = isPortrait ? dims.width * 0.92 : dims.width * 0.6;
  const gridOffsetX = Math.floor((dims.width - gridW) / 2);

  // ИСПРАВЛЕНО: Прямой расчет координат в пикселях от края экрана.
  // Для телефонов — 16px от краев экрана.
  // Для планшетов (iPad) и десктопа — встает ровно к боковым рамкам игрового поля (gridOffsetX).
  const leftPos = isMobilePhone ? 16 : Math.max(16, gridOffsetX + 10);
  const rightPos = isMobilePhone ? 16 : Math.max(16, gridOffsetX + 10);

  const renderGroup = (buttons: typeof leftButtons, isLeft: boolean) => {
    const groupStyle: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      transform: `translateY(-50%) scale(${uiScale})`,
      // ИСПРАВЛЕНО: Используем жесткие left и right для 100% срабатывания позиции
      left: isLeft ? `${leftPos}px` : 'unset',
      right: !isLeft ? `${rightPos}px` : 'unset',
      transformOrigin: isLeft ? 'left center' : 'right center',
    };

    return (
      <div style={groupStyle} className="flex flex-col gap-[36px] portrait:gap-6 pointer-events-auto w-[120px]">
        {buttons.map((btn, idx) => (
          <div key={idx} className="relative w-[120px] h-[120px] cursor-pointer transition-transform active:scale-95" onClick={() => handleAction(btn.click)}>
            <img src="/assets/interface-icons/button.svg" className="absolute inset-0 w-full h-full" alt="bg" />
            <div className="relative w-full h-full p-[15px] z-10 flex items-center justify-center">
              <img src={`/assets/interface-icons/${btn.icon}.svg`} className="w-[90px] h-[90px] object-contain" alt={btn.icon} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
      {renderGroup(leftButtons, true)}
      {renderGroup(rightButtons, false)}
    </div>
  );
}
