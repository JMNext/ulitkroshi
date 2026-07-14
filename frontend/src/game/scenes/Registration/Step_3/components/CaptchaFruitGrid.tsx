import React from 'react';

interface CaptchaFruitGridProps {
  mode: 'select' | 'confirm' | 'verify' | 'error';
  selected: number[];
  isUltraNarrow: boolean;
  isPortrait: boolean;
  getFruitUrl: (i: number) => string;
  onPress: (idx: number) => void;
}

export const CaptchaFruitGrid = ({
  mode,
  selected,
  isUltraNarrow,
  isPortrait,
  getFruitUrl,
  onPress
}: CaptchaFruitGridProps) => {
  const isConfirm = mode === 'confirm';

  // СИНХРОНИЗИРОВАНО: Размеры кнопок в точности как у стандартного PinPad (Шаг 2)
  const btnSizeClass = isUltraNarrow 
    ? 'w-[18vw] h-[18vw] p-2' 
    : (isPortrait ? 'w-[72px] h-[72px] p-2' : 'w-[82px] h-[82px] p-2.5');

  // СИНХРОНИЗИРОВАНО: gap-4 и w-full для идеального совпадения с блоком пин-пада
  return (
    <div className={`grid grid-cols-4 gap-4 justify-center mx-auto transition-opacity duration-200 box-border w-full ${isConfirm ? 'opacity-40 pointer-events-none' : ''}`}>
      {Array.from({ length: 16 }).map((_, idx) => {
        const isSel = selected.includes(idx);
        const hasBorder = isSel && mode !== 'error' && mode !== 'verify';
        return (
          <button 
            key={idx} 
            onClick={() => onPress(idx)} 
            style={{ touchAction: 'manipulation' }} 
            className={`bg-white rounded-full shadow-md active:scale-95 flex items-center justify-center cursor-pointer border-4 transition-all mx-auto box-border ${btnSizeClass} ${hasBorder ? 'border-[#a6f034]' : 'border-transparent'}`}
          >
            <img src={getFruitUrl(idx)} className="w-full h-full object-contain pointer-events-none" alt="fruit" />
          </button>
        );
      })}
    </div>
  );
};
