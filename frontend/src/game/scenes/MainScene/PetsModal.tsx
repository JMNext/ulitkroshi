import React, { useState, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import startPetImg from '/src/assets/start-pet.png';

let petsRoot: Root | null = null;
const CONTAINER_ID = 'pets-modal-overlay';

export const showPetsModal = (): void => {
  let container = document.getElementById(CONTAINER_ID);
  
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.getElementById('game-container')?.appendChild(container);
  }
  
  if (!petsRoot) {
    petsRoot = createRoot(container);
  }
  
  petsRoot.render(<PetsModalComponent />);
};

export const hidePetsModal = (): void => {
  if (petsRoot) { 
    petsRoot.unmount(); 
    petsRoot = null; 
  }
  document.getElementById(CONTAINER_ID)?.remove();
};

const PetsModalComponent = () => {
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClose = () => hidePetsModal();

  const isPortrait = dims.width < dims.height;
  const isLandscapeTablet = !isPortrait && (dims.width / dims.height) < 1.72; // Наш проверенный флаг для Nest Hub / Max
  const isUltraNarrow = isPortrait && (dims.width / dims.height) < 0.5;       // Наш проверенный флаг для Galaxy Fold

  // ИСПРАВЛЕНО: Динамический масштаб всей модалки для жесткого контроля пропорций элементов
  let modalScale = 1.0;
  if (isUltraNarrow) {
    modalScale = Math.min(dims.width / 390, 0.85); // Идеально ужимаем под ширину Fold
  } else if (isLandscapeTablet) {
    modalScale = dims.height < 650 ? 0.75 : 0.85;  // Не даем вылезти за рамки по высоте на Nest Hub
  }

  // ИСПРАВЛЕНО: Для ландшафтных планшетов (Nest Hub) делаем 6 колонок вместо 4, чтобы сетка росла вширь, а не ввысь
  const gridColsClass = isPortrait ? 'grid-cols-4' : (isLandscapeTablet ? 'grid-cols-6' : 'grid-cols-5');

  // ИСПРАВЛЕНО: Перевели размеры вопросительного знака на относительные %, чтобы он никогда не вываливался из карточки на Fold
  const questionCircleClass = isUltraNarrow 
    ? 'w-[70%] h-[70%] text-base' 
    : 'w-[40px] h-[40px] xs:w-[44px] xs:h-[44px] text-xl';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto flex items-center justify-center p-4 box-border overflow-hidden">
      <div 
        style={{ transform: `scale(${modalScale})`, transformOrigin: 'center center' }}
        className="bg-white rounded-[32px] p-5 sm:p-6 w-full max-w-[460px] sm:max-w-[500px] max-h-[82vh] flex flex-col shadow-2xl border-4 border-[#ffca28] box-border transition-all duration-150"
      >
        <div className="flex justify-between items-center mb-3.5 sm:mb-4 box-border">
          <h3 className="text-[#1a3d1c] font-black text-xl sm:text-2xl m-0 p-0 select-none">Мои питомцы (1/20)</h3>
          <button 
            onClick={handleClose} 
            style={{ touchAction: 'manipulation' }}
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer active:scale-95 transition-transform border-none bg-transparent p-1 outline-none select-none"
          >
            ✕
          </button>
        </div>
        
        <div className={`grid ${gridColsClass} gap-2.5 sm:gap-3 overflow-y-auto pr-1 py-1.5 box-border scrollbar-thin`}>
          {Array.from({ length: 20 }).map((_, index) => (
            <div 
              key={index} 
              className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-slate-200/80 shadow-inner relative overflow-hidden box-border"
            >
              {index === 0 ? (
                <img src={startPetImg} className="w-full h-full object-contain p-1.5 pointer-events-none" alt="start-pet" />
              ) : (
                <div className={`bg-white rounded-full flex items-center justify-center font-black text-slate-400 border border-slate-300 shadow-sm select-none box-border ${questionCircleClass}`}>
                  ?
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
