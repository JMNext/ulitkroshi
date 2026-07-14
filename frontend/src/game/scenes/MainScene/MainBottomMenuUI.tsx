import Phaser from 'phaser';
import React, { useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import menuBgDesktop from '../../../assets/background/bottom-menu-desktop.svg';
import menuBgMobile from '../../../assets/background/bottom-menu-mobile.svg';
import buttonBgUrl from '../../../assets/buttom_menu-icons/button.svg';
import eatIcon from '../../../assets/buttom_menu-icons/eat.svg';
import playIcon from '../../../assets/buttom_menu-icons/play.svg';
import sleepIcon from '../../../assets/buttom_menu-icons/sleep.svg';
import washIcon from '../../../assets/buttom_menu-icons/wash.svg';
import { ActionPetCharacter } from './animations/ActionPetCharacter';
import { BasePetCharacter } from './animations/BasePetCharacter';
import { startFeedingDrag, startPlayingDrag, startWashingDrag } from './PetCareActions';

interface IMainGameScene extends Phaser.Scene {
  actionCharacter?: ActionPetCharacter | null;
  baseCharacter?: BasePetCharacter | null;
}
interface MenuItem {
  text: string;
  icon: string;
  action: (e: TouchEvent | MouseEvent) => void;
}

let bottomRoot: Root | null = null;
const CONTAINER_ID = 'main-bottom-ui-overlay';

export const renderMainBottomMenuUI = (scene: IMainGameScene): void => {
  let c = document.getElementById(CONTAINER_ID);
  if (!c) {
    c = document.createElement('div');
    c.id = CONTAINER_ID;
    document.getElementById('game-container')?.appendChild(c);
  }
  c.className = 'absolute top-0 left-0 w-full h-full pointer-events-none z-10';
  if (!bottomRoot && c) bottomRoot = createRoot(c);
  bottomRoot?.render(<MainBottomMenuComponent scene={scene} />);
};

export const destroyMainBottomMenuUI = (): void => {
  if (bottomRoot) {
    bottomRoot.unmount();
    bottomRoot = null;
  }
  document.getElementById(CONTAINER_ID)?.remove();
};

const MainBottomMenuComponent = ({ scene }: { scene: IMainGameScene }) => {
  const [dims, setDims] = useState({
    width: scene.sys.game.canvas.width / (window.devicePixelRatio || 1),
    height: scene.sys.game.canvas.height / (window.devicePixelRatio || 1),
  });
  const bRef = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    let tId: number;
    const up = () => {
      window.cancelAnimationFrame(tId);
      tId = window.requestAnimationFrame(() => {
        const cv = scene.sys.game.canvas;
        if (cv) setDims({ width: cv.clientWidth, height: cv.clientHeight });
      });
    };
    scene.scale.on('resize', up);
    window.addEventListener('resize', up, { passive: true });
    up();
    return () => {
      scene.scale.off('resize', up);
      window.cancelAnimationFrame(tId);
      window.removeEventListener('resize', up);
    };
  }, [scene]);

  const act = (txt: string, cb: () => void) => {
    if (
      !scene.actionCharacter?.currentAnim &&
      !(scene.baseCharacter?.isSleeping && txt !== 'Спать')
    )
      cb();
  };
  const items: MenuItem[] = [
    {
      text: 'Кормить',
      icon: eatIcon,
      action: (e) => {
        if (scene.baseCharacter && scene.actionCharacter)
          startFeedingDrag(scene, scene.baseCharacter, scene.actionCharacter, e);
      },
    },
    {
      text: 'Мыть',
      icon: washIcon,
      action: (e) => {
        if (scene.baseCharacter && scene.actionCharacter)
          startWashingDrag(scene, scene.baseCharacter, scene.actionCharacter, e);
      },
    },
    {
      text: 'Играть',
      icon: playIcon,
      action: (e) => {
        if (scene.baseCharacter && scene.actionCharacter)
          startPlayingDrag(scene, scene.baseCharacter, scene.actionCharacter, e);
      },
    },
    { text: 'Спать', icon: sleepIcon, action: () => scene.baseCharacter?.toggleSleep() },
  ];

  useEffect(() => {
    const ups: (() => void)[] = [];
    items.forEach((item) => {
      const el = bRef.current.get(item.text);
      if (!el) return;
      const ts = (e: TouchEvent) => {
        e.preventDefault();
        act(item.text, () => item.action(e));
      };
      el.addEventListener('touchstart', ts, { passive: false });
      ups.push(() => el.removeEventListener('touchstart', ts));
    });
    return () => ups.forEach((c) => c());
  }, [scene.baseCharacter, scene.actionCharacter, dims]);

  const isPort = dims.width < dims.height,
    isMob = dims.width < 767,
    isTab = !isPort && dims.width / dims.height < 1.72,
    useMob = isMob || (isPort && dims.width / dims.height < 1.65 && dims.width < 550);
  const bg = useMob ? menuBgMobile : menuBgDesktop;
  const wrapStyle: React.CSSProperties = useMob
    ? {
        position: 'absolute',
        left: '50%',
        bottom: '0',
        width: dims.width,
        height: '180px',
        transform: 'translateX(-50%)',
        zIndex: 10,
      }
    : {
        position: 'absolute',
        left: '50%',
        bottom: '0',
        width: `${dims.width}px`,
        height: isPort ? '210px' : isTab ? '140px' : '185px',
        zIndex: 10,
        transform: 'translateX(-50%)',
      };
  const scale = useMob
    ? Math.min(dims.width / 390, 1.0)
    : isPort
      ? 0.85
      : isTab
        ? 0.68
        : Math.min((dims.width / 1920) * 0.85, 1.1);
  const padBot = useMob ? `${28 * scale}px` : isTab ? '8px' : '32px';

  return (
    <div className="pointer-events-none absolute top-0 left-0 z-10 h-full w-full">
      <div
        style={wrapStyle}
        className="pointer-events-auto">
        <img
          src={bg}
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '100%',
            height: '100%',
            objectFit: 'fill',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
          }}
          alt="menu-bg"
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: 'bottom center',
            width: '100%',
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'end',
            gap: useMob ? '16px' : '36px',
            paddingBottom: padBot,
          }}>
          {items.map((item) => (
            <div
              key={item.text}
              ref={(n) => {
                if (n) bRef.current.set(item.text, n);
                else bRef.current.delete(item.text);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                act(item.text, () => item.action(e.nativeEvent));
              }}
              style={{ touchAction: 'manipulation', width: useMob ? '78px' : '100px' }}
              className="flex cursor-pointer flex-col items-center transition-transform duration-75 active:scale-95">
              <div
                className={`relative ${useMob ? 'h-[78px] w-[78px]' : 'h-[100px] w-[100px]'} flex items-center justify-center`}>
                <img
                  src={buttonBgUrl}
                  className="absolute inset-0 h-full w-full"
                  alt="btn-bg"
                />
                <img
                  src={item.icon}
                  className={`relative ${useMob ? 'h-[50px] w-[50px]' : 'h-[64px] w-[64px]'} z-10`}
                  alt={item.text}
                />
              </div>
              <span
                className={`${useMob ? 'text-[14px]' : 'text-[18px]'} mt-1.5 block w-full text-center leading-none font-bold tracking-wide text-[#424242] select-none`}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
