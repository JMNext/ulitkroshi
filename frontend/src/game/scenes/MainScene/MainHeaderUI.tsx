import Phaser from 'phaser';
import { useEffect, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import coinIcon from '../../../assets/buttom_menu-icons/eat.svg';
import avatarIcon from '../../../assets/interface-icons/icon-avatar.svg';
import plusIcon from '../../../assets/interface-icons/plus.svg';
import { ActionPetCharacter } from './animations/ActionPetCharacter';
import { BasePetCharacter } from './animations/BasePetCharacter';

interface IMainGameScene extends Phaser.Scene {
  actionCharacter?: ActionPetCharacter | null;
  baseCharacter?: BasePetCharacter | null;
}

let headerRoot: Root | null = null;
const CONTAINER_ID = 'main-header-ui-overlay';

export const renderMainHeaderUI = (scene: IMainGameScene): void => {
  let c = document.getElementById(CONTAINER_ID);
  if (!c) {
    c = document.createElement('div');
    c.id = CONTAINER_ID;
    document.getElementById('game-container')?.appendChild(c);
  }
  c.className = 'absolute top-0 left-0 w-full h-full pointer-events-none z-30';
  if (!headerRoot && c) headerRoot = createRoot(c);
  headerRoot?.render(<MainHeaderComponent scene={scene} />);
};

export const destroyMainHeaderUI = (): void => {
  if (headerRoot) {
    headerRoot.unmount();
    headerRoot = null;
  }
  document.getElementById(CONTAINER_ID)?.remove();
};

const MainHeaderComponent = ({ scene }: { scene: IMainGameScene }) => {
  const [dims, setDims] = useState({
    width: scene.sys.game.canvas.width / (window.devicePixelRatio || 1),
    height: scene.sys.game.canvas.height / (window.devicePixelRatio || 1),
  });

  useEffect(() => {
    const up = () => {
      const canvas = scene.sys.game.canvas;
      if (canvas) setDims({ width: canvas.clientWidth, height: canvas.clientHeight });
    };
    scene.scale.on('resize', up);
    window.addEventListener('resize', up, { passive: true });
    up();
    return () => {
      scene.scale.off('resize', up);
      window.removeEventListener('resize', up);
    };
  }, [scene]);

  const clickAvatar = () => {
    if (!scene.actionCharacter?.currentAnim && !scene.baseCharacter?.isSleeping) {
      scene.events.emit('ui_hide_health_bar');
      scene.events.emit('ui_open_profile_edit');
    }
  };

  const isPort = dims.width < dims.height,
    isMob = dims.width < 550,
    useMob = isMob || (isPort && dims.width / dims.height < 1.65 && isMob),
    isLandMob = !isPort && dims.height < 700;
  const uiScale = useMob
    ? Math.min(dims.width / 520, 0.85)
    : isPort
      ? 1.1
      : isLandMob
        ? 0.68
        : 0.85;
  const gridW = useMob
    ? dims.width
    : isPort
      ? dims.width * 0.94
      : isLandMob
        ? dims.width * 0.95
        : dims.width;
  const edge = useMob
    ? 16
    : isPort || isLandMob
      ? Math.max(isLandMob ? 20 : 24, Math.floor((dims.width - gridW) / 2))
      : 40;
  const top = useMob ? 16 : isLandMob ? 20 : 40;

  return (
    <div className="pointer-events-none absolute top-0 left-0 z-30 h-full w-full">
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: dims.width,
          height: '120px',
          transform: 'translateX(-50%)',
          zIndex: 30,
          pointerEvents: 'none',
        }}>
        <div
          style={{
            position: 'absolute',
            top,
            left: `${edge}px`,
            transform: `scale(${uiScale})`,
            transformOrigin: 'top left',
          }}>
          <div className="pointer-events-auto relative flex h-[70px] max-w-[240px] min-w-[160px] items-center justify-between rounded-[35px] border border-slate-100 bg-white pr-[75px] pl-[15px] shadow-[0_10px_15px_rgba(0,0,0,0.06)]">
            <img
              src={coinIcon}
              className="h-[60px] w-[60px] shrink-0"
              alt="coin"
            />
            <span className="flex-1 px-2 text-center text-2xl leading-none font-bold text-[#1a3d1c] select-none">
              0
            </span>
            <img
              src={plusIcon}
              className="absolute right-[12px] h-[50px] w-[50px] cursor-pointer transition-transform active:scale-90"
              alt="plus"
            />
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            top,
            right: `${edge}px`,
            transform: `scale(${uiScale})`,
            transformOrigin: 'top right',
          }}>
          <div
            className="pointer-events-auto h-[100px] w-[100px] cursor-pointer transition-transform active:scale-95"
            onClick={clickAvatar}>
            <img
              src={avatarIcon}
              className="h-full w-full rounded-full object-cover shadow-md"
              alt="avatar"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
