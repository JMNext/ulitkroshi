// CaptchaFruitGrid.tsx
import React from 'react';
import { useRegistrationStep3Store } from '../useRegistrationStep3Store';

const fImgs = import.meta.glob('/src/assets/fruits/fruits_*.png', { eager: true, query: '?url' }) as Record<string, { default: string }>;
const ID_MAP: Record<number, string> = { 0: '01', 1: '02', 2: '0003_13', 3: '03', 4: '04', 5: '05', 6: '06', 7: '0007_09', 8: '07', 9: '08', 10: '10', 11: '11', 12: '12', 13: '14', 14: '15', 15: '16' };
export const getFruitUrl = (i: number): string => fImgs[`/src/assets/fruits/fruits_${ID_MAP[i]}.png`]?.default || '';

interface CaptchaFruitGridProps {
  onPress: (idx: number) => void;
}

export const CaptchaFruitGrid = ({ onPress }: CaptchaFruitGridProps) => {
  const { mode, sel: selected, fruitOrder, shake, attempts } = useRegistrationStep3Store();
  const isConfirm = mode === 'confirm';

  return (
    <nav 
      style={{ animation: shake ? 'captchaShakeEffect 0.5s ease-in-out' : 'none' }} 
      className="flex flex-col justify-center shrink-0 box-border overflow-hidden select-none pointer-events-auto p-0 relative w-[455px] h-[455px]"
    >
      <style>{`@keyframes captchaShakeEffect { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }`}</style>
      
      <div 
        className={`grid grid-cols-4 grid-rows-4 w-full h-full box-border shrink-0 select-none gap-x-[20px] gap-y-[20px] ${isConfirm ? 'opacity-40' : ''}`}
      >
        {fruitOrder.map((fruitId) => (
          <button 
            key={fruitId} 
            type="button"
            disabled={isConfirm || mode === 'error' || attempts >= 3}
            onClick={() => onPress(fruitId)} 
            style={{ 
              touchAction: 'manipulation',
              borderColor: selected.includes(fruitId) && mode !== 'error' ? '#a6f034' : 'transparent',
              borderWidth: '4px'
            }} 
            className="relative outline-none w-full h-full bg-white border-solid rounded-full shadow-md flex items-center justify-center transition-all box-border shrink-0 active:scale-95 cursor-pointer pointer-events-auto p-2.5"
          >
            <img src={getFruitUrl(fruitId)} className="w-full h-full object-contain pointer-events-none" alt="" />
          </button>
        ))}
      </div>
    </nav>
  );
};
