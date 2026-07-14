import React, { useState, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import Phaser from 'phaser';
import { MainPetPosition } from './MainPetPosition';
import lifeIcon from '../../../assets/interface-icons/life.svg';

let healthRoot: Root | null = null;
const CONTAINER_ID = 'main-health-ui-overlay';
let savedPetName: string = 'Булька';
const nameListeners = new Set<(name: string) => void>();

export const setGlobalPetName = (name: string): void => {
  if (name?.trim()) {
    savedPetName = name.trim();
    nameListeners.forEach(cb => cb(savedPetName));
  }
};

interface PetHealthBarProps {
  scene: Phaser.Scene;
  washState: 'idle' | 'hidden' | 'glowing';
  hp: number;
}

const PetHealthBar = ({ scene, washState, hp }: PetHealthBarProps) => {
  const [petName, setPetName] = useState(savedPetName);
  const [petTransform, setPetTransform] = useState(() => MainPetPosition.getInstance(scene).getTransform());
  const [gameDims, setGameDims] = useState({
    width: scene.sys.game.canvas.width / (window.devicePixelRatio || 1),
    height: scene.sys.game.canvas.height / (window.devicePixelRatio || 1),
  });

  useEffect(() => {
    const update = () => {
      const canvas = scene.sys.game.canvas;
      if (canvas) setGameDims({ width: canvas.clientWidth, height: canvas.clientHeight });
    };
    const handleName = (n: string) => setPetName(n);
    
    nameListeners.add(handleName);
    const unsubPet = MainPetPosition.getInstance(scene).subscribe(t => setPetTransform(t));
    scene.scale.on('resize', update);
    window.addEventListener('resize', update);
    update();
    
    return () => {
      nameListeners.delete(handleName);
      unsubPet();
      scene.scale.off('resize', update);
      window.removeEventListener('resize', update);
    };
  }, [scene]);

  const isHidden = washState === 'hidden', isGlowing = washState === 'glowing';
  const isPortrait = gameDims.width < gameDims.height;
  const isMobilePhone = gameDims.width < 550;
  const useMobileLayout = isMobilePhone || (isPortrait && (gameDims.width / gameDims.height) < 1.65 && gameDims.width < 550);
  const isLandscapeMobile = !isPortrait && gameDims.height < 700;

  // ФИКС МАСШТАБА ДЛЯ NEST HUB: на альбомных планшетах снижаем масштаб хелсбара до 0.72, чтобы он выглядел компактно
  const currentUiScale = useMobileLayout 
    ? Math.min(gameDims.width / 420, 0.82) 
    : (isPortrait ? 1.15 : (isLandscapeMobile ? 0.72 : 1.0));
  
  // ФИКС ОТСТУПА ДЛЯ NEST HUB: прижимаем плотнее к рожкам (отступ -30px), чтобы блок не упирался в верхний хедер монет
  const finalTopY = (petTransform?.petTopY ?? (gameDims.height * 0.4)) - (isPortrait && !isMobilePhone ? 50 : (isLandscapeMobile ? 30 : 40));

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
      <div style={{ position: 'absolute', left: '50%', top: 0, width: gameDims.width, height: gameDims.height, transform: 'translateX(-50%)', pointerEvents: 'none' }}>
        <div 
          style={{
            position: 'absolute',
            left: petTransform?.x ?? (gameDims.width / 2),
            top: finalTopY,
            width: '360px',
            // Уменьшили высоту контейнера со 220px до 180px на альбомных экранах, чтобы текст имени гарантированно не резался верхней кромкой экрана
            height: isLandscapeMobile ? '180px' : '220px',
            transform: `translateX(-50%) translateY(-100%) scale(${currentUiScale})`,
            transformOrigin: 'bottom center',
            transition: 'opacity 0.3s ease, transform 0.3s ease'
          }}
          className={`flex flex-col items-center justify-end gap-3 ${isHidden ? 'opacity-0 scale-95' : 'opacity-100'}`}
        >
          <div className="flex-grow flex flex-col justify-end w-full pb-1">
            <span className="text-[34px] font-black text-[#1a3d1c] text-center w-full leading-none tracking-wide block truncate select-none">
              {petName}
            </span>
          </div>
          
          <div className={`relative w-[240px] h-[36px] flex justify-center items-center bg-white/95 rounded-full border border-slate-200/50 shadow-[0_4px_10px_rgba(0,0,0,0.04)] pl-5 pr-3 pointer-events-auto transition-all duration-500 ${isGlowing ? 'shadow-[0_0_25px_rgba(97,170,5,0.8)] border-[#61aa05]' : ''}`}>
            <div className="flex items-center w-full relative">
              <img src={lifeIcon} className="absolute w-[42px] h-[42px] -left-10 z-10" alt="life" />
              <div className="w-[180px] h-2.5 bg-[#ededed] rounded-full overflow-hidden ml-4 flex items-center">
                <div style={{ width: `${hp}%`, backgroundColor: '#61aa05' }} className="h-full rounded-full transition-all duration-300" />
              </div>
            </div>
          </div>

          <span className="text-[26px] font-black text-[#1a3d1c] leading-none text-center select-none block w-full">
            {hp}%
          </span>
        </div>
      </div>
    </div>
  );
};

export const renderMainHealthUI = (scene: Phaser.Scene, washState: 'idle' | 'hidden' | 'glowing' = 'idle', currentHp = 100): void => {
  let el = document.getElementById(CONTAINER_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = CONTAINER_ID;
    document.getElementById('game-container')?.appendChild(el);
  }
  el.className = "absolute top-0 left-0 w-full h-full pointer-events-none z-20";
  if (!healthRoot && el) healthRoot = createRoot(el);
  healthRoot?.render(<PetHealthBar scene={scene} washState={washState} hp={currentHp} />);
};

export const destroyMainHealthUI = (): void => {
  if (healthRoot) {
    healthRoot.unmount();
    healthRoot = null;
  }
  document.getElementById(CONTAINER_ID)?.remove();
};
