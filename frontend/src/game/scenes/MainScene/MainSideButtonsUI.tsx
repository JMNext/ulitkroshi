import Phaser from 'phaser';
import { useEffect, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import buttonBg from '../../../assets/interface-icons/button.svg';
import fotoIcon from '../../../assets/interface-icons/foto.svg';
import minigameIcon from '../../../assets/interface-icons/mini-game.svg';
import mypetsIcon from '../../../assets/interface-icons/my-pets.svg';
import shopIcon from '../../../assets/interface-icons/shop.svg';
import { ActionPetCharacter } from './animations/ActionPetCharacter';
import { BasePetCharacter } from './animations/BasePetCharacter';

interface IMainGameScene extends Phaser.Scene {
  actionCharacter?: ActionPetCharacter | null;
  baseCharacter?: BasePetCharacter | null;
}
interface GroupButton {
  icon: string;
  src: string;
  event: string;
}

let sideRoot: Root | null = null;
const CONTAINER_ID = 'main-side-ui-overlay';

export function renderMainSideButtonsUI(scene: IMainGameScene): void {
  let c = document.getElementById(CONTAINER_ID);
  if (!c) {
    c = document.createElement('div');
    c.id = CONTAINER_ID;
    document.getElementById('game-container')?.appendChild(c);
  }
  c.className = 'absolute top-0 left-0 w-full h-full pointer-events-none z-20';
  if (!sideRoot && c) sideRoot = createRoot(c);
  sideRoot?.render(<MainSideButtonsComponent scene={scene} />);
}

export function destroyMainSideButtonsUI(): void {
  if (sideRoot) {
    sideRoot.unmount();
    sideRoot = null;
  }
  document.getElementById(CONTAINER_ID)?.remove();
}

function MainSideButtonsComponent({ scene }: { scene: IMainGameScene }) {
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

  const act = (key: string) => {
    if (!scene.actionCharacter?.currentAnim && !scene.baseCharacter?.isSleeping)
      scene.events.emit(key);
  };
  const isPort = dims.width < dims.height,
    isMob = dims.width < 767,
    isLandMob = !isPort && dims.height < 700,
    isFold = isPort && dims.width / dims.height < 0.5;
  const scale = isFold ? 0.38 : isMob ? 0.45 : isLandMob ? 0.65 : 0.85;
  const sidePos = isFold
    ? 8
    : isMob
      ? 30
      : Math.floor((dims.width - dims.width * (isPort ? 0.88 : 0.6)) / 2);

  const renderGroup = (btns: GroupButton[], isLeft: boolean) => (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        transform: `translateY(-50%) scale(${scale})`,
        left: isLeft ? `${sidePos}px` : 'unset',
        right: !isLeft ? `${sidePos}px` : 'unset',
        transformOrigin: isLeft ? 'left center' : 'right center',
      }}
      className="pointer-events-auto flex w-[160px] flex-col gap-8 portrait:gap-4">
      {btns.map((btn, i) => (
        <div
          key={i}
          className="relative h-[160px] w-[160px] cursor-pointer transition-transform active:scale-95"
          onClick={() => act(btn.event)}>
          <img
            src={buttonBg}
            className="absolute inset-0 h-full w-full"
            alt="bg"
          />
          <div className="relative z-10 flex h-full w-full items-center justify-center p-6">
            <img
              src={btn.src}
              className="h-full w-full object-contain"
              alt={btn.icon}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="pointer-events-none absolute top-0 left-0 z-20 h-full w-full">
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: dims.width,
          height: dims.height,
          transform: 'translateX(-50%)',
          zIndex: 20,
          pointerEvents: 'none',
        }}>
        {renderGroup(
          [
            { icon: 'shop', src: shopIcon, event: 'ui_open_shop' },
            { icon: 'foto', src: fotoIcon, event: 'ui_take_screenshot' },
          ],
          true
        )}
        {renderGroup(
          [
            { icon: 'minigame', src: minigameIcon, event: 'ui_open_minigame' },
            { icon: 'mypets', src: mypetsIcon, event: 'ui_open_pets' },
          ],
          false
        )}
      </div>
    </div>
  );
}
