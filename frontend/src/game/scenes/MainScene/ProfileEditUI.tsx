import React, { useState, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import avatarIcon from '/src/assets/interface-icons/icon-avatar.svg';
import editButtonIcon from '/src/assets/interface-icons/button_edit.svg';

// Исправлено: синхронизировали литеральный тип со сценой, убрав конфликт string
export interface IProfileScene {
  updateHealthBarPosition?: (state: 'idle' | 'hidden' | 'glowing') => void;
}

interface ProfileEditComponentProps {
  scene?: IProfileScene;
}

let profileRoot: Root | null = null;
const CONTAINER_ID = 'profile-edit-ui-overlay';

export const renderProfileEditUI = (scene: IProfileScene): void => {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.getElementById('game-container')?.appendChild(container);
  }
  if (!profileRoot) profileRoot = createRoot(container);
  profileRoot.render(<ProfileEditComponent scene={scene} />);
};

export const destroyProfileEditUI = (): void => {
  if (profileRoot) { 
    profileRoot.unmount(); 
    profileRoot = null; 
  }
  document.getElementById(CONTAINER_ID)?.remove();
};

const ProfileEditComponent = ({ scene }: ProfileEditComponentProps) => {
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      window.cancelAnimationFrame(timeoutId);
      timeoutId = window.requestAnimationFrame(() => {
        setDims({ width: window.innerWidth, height: window.innerHeight });
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.cancelAnimationFrame(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const goBack = () => {
    if (scene && typeof scene.updateHealthBarPosition === 'function') {
      scene.updateHealthBarPosition('idle');
    }
    destroyProfileEditUI();
  };

  const isPortrait = dims.width < dims.height;
  const isLandscapeTablet = !isPortrait && (dims.width / dims.height) < 1.72;
  const isUltraNarrow = isPortrait && (dims.width / dims.height) < 0.5;

  let profileScale = 1.0;
  if (isUltraNarrow) {
    profileScale = Math.min(dims.width / 390, 0.85);
  } else if (isLandscapeTablet) {
    profileScale = dims.height < 650 ? 0.75 : 0.85;
  }

  const wrapperPaddingClass = isLandscapeTablet ? 'p-5 sm:p-6' : 'p-6 sm:p-8';
  const avatarSizeClass = isLandscapeTablet ? 'w-[100px] h-[100px] mb-3' : 'w-[130px] h-[130px] mb-4';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto flex items-center justify-center p-4 box-border overflow-hidden">
      <div 
        style={{ transform: `scale(${profileScale})`, transformOrigin: 'center center' }}
        className={`bg-white rounded-[32px] w-full max-w-[360px] sm:max-w-[420px] flex flex-col items-center shadow-2xl border-4 border-[#ffca28] relative box-border transition-all duration-150 ${wrapperPaddingClass}`}
      >
        <button onClick={goBack} style={{ touchAction: 'manipulation' }} className="absolute top-4 right-5 text-slate-400 hover:text-slate-600 text-2xl font-bold p-1 cursor-pointer transition-colors active:scale-95 border-none bg-transparent outline-none select-none">✕</button>

        <div className={`relative mt-2 box-border ${avatarSizeClass}`}>
          <img src={avatarIcon} className="w-full h-full rounded-full border-4 border-solid border-slate-100 shadow-md object-cover pointer-events-none" alt="avatar" />
          <div onClick={() => console.log('Клик по редактированию аватара')} style={{ touchAction: 'manipulation' }} className="absolute bottom-0 right-0 w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] cursor-pointer active:scale-95 transition-transform z-10">
            <img src={editButtonIcon} className="w-full h-full object-contain pointer-events-none" alt="edit-avatar-icon" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-[#1a3d1c] mb-4 sm:mb-6 tracking-wide m-0 select-none">Вася5655</h2>

        <button onClick={() => console.log('Заглушка: Добавление питомца')} style={{ touchAction: 'manipulation' }} className="w-full h-[52px] sm:h-[58px] bg-gradient-to-b from-[#ffca28] to-[#ffb300] text-white font-black text-lg sm:text-xl rounded-[29px] shadow-[0_4px_0_#e69d00,0_8px_12px_rgba(0,0,0,0.12)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center border-none mb-1.5 cursor-pointer uppercase tracking-wide box-border">Добавить питомца</button>

        <div className="mt-3 text-xs sm:text-sm font-black text-slate-400 underline cursor-pointer hover:text-slate-600 select-none" onClick={goBack}>Вернуться назад</div>
      </div>
    </div>
  );
};
