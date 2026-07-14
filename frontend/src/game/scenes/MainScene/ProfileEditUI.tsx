import React from 'react';
import { createRoot, Root } from 'react-dom/client';

let profileRoot: Root | null = null;
const CONTAINER_ID = 'profile-edit-ui-overlay';

export function renderProfileEditUI(scene: any): void {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.getElementById('game-container')?.appendChild(container);
  }
  if (!profileRoot) profileRoot = createRoot(container);
  profileRoot.render(<ProfileEditComponent scene={scene} />);
}

export function destroyProfileEditUI(): void {
  if (profileRoot) { profileRoot.unmount(); profileRoot = null; }
  document.getElementById(CONTAINER_ID)?.remove();
}

function ProfileEditComponent({ scene }: { scene: any }) {
  const goBack = () => {
    // Возвращаем хелсбар обратно в Phaser
    if (scene && typeof scene.updateHealthBarPosition === 'function') {
      scene.updateHealthBarPosition('idle');
    }
    
    // ИСПРАВЛЕНО: Просто закрываем модалку профиля. 
    // Никакие renderMainHeaderUI и прочие функции вызывать здесь не нужно, 
    // чтобы не ломать и не стирать уже созданный при старте игры интерфейс!
    destroyProfileEditUI();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-[420px] flex flex-col items-center shadow-2xl border-4 border-[#ffca28] relative">
        
        <button 
          onClick={goBack} 
          className="absolute top-4 right-5 text-slate-400 hover:text-slate-600 text-2xl font-bold p-1 cursor-pointer transition-colors active:scale-95"
        >
          ✕
        </button>

        <div className="relative w-[130px] h-[130px] mb-4 mt-2">
          <img src="/assets/interface-icons/icon-avatar.svg" className="w-full h-full rounded-full border-4 border-slate-100 shadow-md object-cover" alt="avatar" />
          <div 
            className="absolute bottom-0 right-0 w-[38px] h-[38px] cursor-pointer active:scale-95 transition-transform"
            onClick={() => console.log('Клик по редактированию аватара')}
          >
            <img src="/assets/interface-icons/button_edit.svg" className="w-full h-full object-contain" alt="edit-avatar-icon" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-[#1a3d1c] mb-6 tracking-wide">
          Вася5655
        </h2>

        <button 
          onClick={() => console.log('Заглушка: Добавление питомца')}
          className="w-full h-[58px] bg-gradient-to-b from-[#ffca28] to-[#ffb300] text-white font-black text-xl rounded-[29px] shadow-[0_5px_0_#e69d00,0_10px_15px_rgba(0,0,0,0.12)] active:translate-y-[3px] active:shadow-[0_1px_0_#e69d00] transition-all flex items-center justify-center border-b border-white/20 mb-2 cursor-pointer"
        >
          Добавить питомца
        </button>

        <div className="mt-4 text-sm font-medium text-slate-400 underline cursor-pointer hover:text-slate-600" onClick={goBack}>
          Вернуться назад
        </div>

      </div>
    </div>
  );
}
