import React, { useState, useEffect } from 'react';
import normalButtonBg from '/src/assets/board/button.svg';
import redButtonBg from '/src/assets/board/red_button.svg';

interface PinPadProps {
  isDisabled?: boolean;
  isDesktopSize?: boolean;
  onKeyClick: (key: string) => void;
}

export const PinPad = ({ isDisabled = false, isDesktopSize = false, onKeyClick }: PinPadProps) => {
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0', 'delete'];

  useEffect(() => {
    const handleResize = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePress = (k: string) => {
    if (isDisabled) return;
    onKeyClick(k === 'delete' ? 'BACKSPACE' : k);
  };

  const isPortrait = dims.width < dims.height;
  const isUltraNarrow = isPortrait && (dims.width / dims.height) < 0.5; // Наш проверенный флаг для Galaxy Fold

  // ИСПРАВЛЕНО: Убираем хардкод ширины на ультра-узких телефонах, переводим на адаптивные проценты
  let padWidth = isDesktopSize ? '360px' : '312px';
  if (isUltraNarrow) {
    padWidth = '100%'; // Разрешаем тянуться во всю доступную ширину родительского блока
  }

  // ИСПРАВЛЕНО: Для обычных условий используем фиксированные размеры, 
  // а для ультра-узких экранов переводим кнопки на гибкие проценты (w-[29%] с учетом gap)
  const btnSize = isUltraNarrow 
    ? 'w-[29vw] max-w-[88px] aspect-square h-auto' 
    : (isDesktopSize ? 'w-[102px] h-[102px]' : 'w-[88px] h-[88px]');

  // Адаптируем шрифты под размеры кнопок
  const fontSize = isUltraNarrow ? 'text-[8vw] max-text-[34px]' : (isDesktopSize ? 'text-[40px]' : 'text-[34px]');
  const crossSize = isUltraNarrow ? 'text-[7vw] max-text-[30px]' : (isDesktopSize ? 'text-[36px]' : 'text-[30px]');
  const gapClass = isUltraNarrow ? 'gap-x-[4vw] gap-y-[2.5vw]' : 'gap-x-6 gap-y-3.5';

  return (
    <div 
      className={`grid grid-cols-3 justify-center mx-auto select-none px-4 box-border ${gapClass} ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}
      style={{ width: padWidth, maxWidth: isDesktopSize ? '360px' : '312px' }}
    >
      {keys.map((key) => {
        const isDelete = key === 'delete';
        const bgSrc = isDelete ? redButtonBg : normalButtonBg;

        return (
          <button
            key={key}
            disabled={isDisabled}
            onClick={() => handlePress(key)}
            style={{ touchAction: 'manipulation' }}
            className={`relative pointer-events-auto active:scale-95 transition-transform flex items-center justify-center cursor-pointer outline-none bg-transparent border-none p-0 mx-auto ${btnSize}`}
          >
            <img src={bgSrc} className="w-full h-full object-contain pointer-events-none drop-shadow-md" alt="button-bg" />
            <div className={`absolute inset-0 flex items-center justify-center font-sans font-black ${fontSize} select-none box-border`}>
              {isDelete ? (
                <span className={`-mt-1 text-white ${crossSize} font-extrabold`}>✕</span>
              ) : (
                <span className="-mt-0.5 text-slate-700">{key}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
