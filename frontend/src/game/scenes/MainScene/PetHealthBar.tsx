import React from 'react';
import { createRoot, Root } from 'react-dom/client';

let healthRoot: Root | null = null;
const HEALTH_CONFIG = {
  containerId: 'main-health-ui-overlay',
  petName: 'Булька',
  gapClass: 'gap-2.5',
  widthClass: 'w-[240px]',
  barHeightClass: 'h-2.5',
  bgProgress: '#61aa05',
};

const PetHealthBar = ({ name, topOffset, uiScale, washState, hp }: { name: string; topOffset: number; uiScale: number; washState: 'idle' | 'hidden' | 'glowing'; hp: number }) => {
  const isHidden = washState === 'hidden';
  const isGlowing = washState === 'glowing';
  const blockHeight = 110;
  const scaleCompensation = (1 - uiScale) * (blockHeight / 2);
  const calculatedTop = topOffset - (20 * uiScale) + scaleCompensation;

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: `${calculatedTop}px`,
    transform: `translateX(-50%) scale(${uiScale})`,
    transformOrigin: 'top center',
    zIndex: 20
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
      <div style={containerStyle} className={`flex flex-col items-center transition-all duration-300 ${isHidden ? 'opacity-0 scale-95' : 'opacity-100'} ${HEALTH_CONFIG.gapClass} ${HEALTH_CONFIG.widthClass}`}>
        <span className="text-[32px] font-black text-[#1a3d1c] text-center w-full leading-[36px] tracking-wide block truncate">{name}</span>
        <div className={`relative ${HEALTH_CONFIG.widthClass} h-[36px] flex justify-center items-center bg-white/95 rounded-full border border-slate-200/50 shadow-[0_4px_10px_rgba(0,0,0,0.04)] pl-5 pr-3 pointer-events-auto transition-all duration-500 ${isGlowing ? 'shadow-[0_0_25px_rgba(97,170,5,0.8)] border-[#61aa05]' : ''}`}>
          <div className="flex items-center w-full relative">
            <img src="/assets/interface-icons/life.svg" className="w-[42px] h-[42px] -ml-7 z-10" alt="life" />
            <div className="w-[180px] h-2.5 bg-[#ededed] rounded-full overflow-hidden ml-1.5 flex items-center">
              <div style={{ width: `${hp}%`, backgroundColor: HEALTH_CONFIG.bgProgress }} className={`h-full ${HEALTH_CONFIG.barHeightClass} rounded-full transition-all duration-300`} />
            </div>
          </div>
        </div>
        <span className="text-[28px] font-black text-[#1a3d1c] leading-none text-center">{hp}%</span>
      </div>
    </div>
  );
};

export const renderMainHealthUI = (topOffset: number, uiScale: number, washState: 'idle' | 'hidden' | 'glowing' = 'idle', currentHp = 100): void => {
  let el = document.getElementById(HEALTH_CONFIG.containerId);
  if (!el) {
    el = document.createElement('div');
    el.id = HEALTH_CONFIG.containerId;
    el.className = "absolute inset-0 pointer-events-none overflow-hidden z-20";
    document.getElementById('game-container')?.appendChild(el);
  }
  if (!healthRoot && el) {
    healthRoot = createRoot(el);
  }
  healthRoot?.render(<PetHealthBar name={HEALTH_CONFIG.petName} topOffset={topOffset} uiScale={uiScale} washState={washState} hp={currentHp} />);
};

export const destroyMainHealthUI = (): void => {
  if (healthRoot) {
    healthRoot.unmount();
    healthRoot = null;
  }
  document.getElementById(HEALTH_CONFIG.containerId)?.remove();
};
