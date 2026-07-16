import React from 'react';
import nextButtonImg from '/src/assets/registration/next_button.png';
import { useRegistrationStep1Store } from '../useRegistrationStep1Store';

interface NextButtonProps {
  onClick: () => void;
}

export const NextButton = ({ onClick }: NextButtonProps) => {
  // Подписываемся на статусы проверки имени из локального стора
  const nameStatus = useRegistrationStep1Store((state) => state.nameStatus);
  const isNameChecking = useRegistrationStep1Store((state) => state.isNameChecking);

  // ТЗ: Кнопка «Далее» активна только при свободном имени
  const isDisabled = nameStatus !== 'available' || isNameChecking;

  return (
    <button 
      type="button" 
      onClick={onClick} 
      disabled={isDisabled}
      className={`next-step-btn ${isDisabled ? 'next-step-btn-disabled opacity-50 cursor-not-allowed pointer-events-none' : ''}`} 
      aria-label="Далее"
    >
      <img src={nextButtonImg} className="w-full h-full object-contain" alt="" />
    </button>
  );
};
