import React from 'react';
import { useRegistrationStep3Store } from '../useRegistrationStep3Store';

interface CaptchaFruitGridProps {
  onPress: (idx: number) => void;
}

const fImgs = import.meta.glob('/src/assets/fruits/fruits_*.png', { eager: true, query: '?url' }) as Record<string, { default: string }>;

const ID_MAP: Record<number, string> = { 
  0: '01', 1: '02', 2: '0003_13', 3: '03', 4: '04', 5: '05', 6: '06', 
  7: '0007_09', 8: '07', 9: '08', 10: '10', 11: '11', 12: '12', 13: '14', 14: '15', 15: '16' 
};

export const getFruitUrl = (i: number): string => fImgs[`/src/assets/fruits/fruits_${ID_MAP[i]}.png`]?.default || '';

export const CaptchaFruitGrid = ({ onPress }: CaptchaFruitGridProps) => {
  const mode = useRegistrationStep3Store((state) => state.mode);
  const selected = useRegistrationStep3Store((state) => state.sel);
  const fruitOrder = useRegistrationStep3Store((state) => state.fruitOrder);

  const isConfirm = mode === 'confirm';

  return (
    <div className={`captcha-grid-container shrink-0 ${isConfirm ? 'captcha-grid-container-disabled' : ''}`}>
      {fruitOrder.map((fruitId) => {
        const isSel = selected.includes(fruitId);
        
        // В режиме verify (когда пользователь угадывает) обводка выбранных элементов ДОЛЖНА работать,
        // но она прячется только в моменты анимации ошибки ('error')
        const hasBorder = isSel && mode !== 'error';
        
        return (
          <button 
            key={fruitId} 
            type="button"
            disabled={isConfirm || mode === 'error'}
            onClick={() => onPress(fruitId)} 
            style={{ touchAction: 'manipulation' }} 
            className={`captcha-fruit-btn ${hasBorder ? 'captcha-fruit-btn-selected' : ''}`}
          >
            <img 
              src={getFruitUrl(fruitId)} 
              className="w-full h-full object-contain pointer-events-none" 
              alt="" 
            />
          </button>
        );
      })}
    </div>
  );
};
