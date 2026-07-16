import React from 'react';
import { useRegistrationStep3Store } from '../useRegistrationStep3Store';

interface CaptchaResetButtonProps {
  onReset: () => void;
}

export const CaptchaResetButton = ({ onReset }: CaptchaResetButtonProps) => {
  const mode = useRegistrationStep3Store((state) => state.mode);
  const isConfirm = mode === 'confirm';

  return (
    <button 
      type="button"
      onClick={onReset} 
      disabled={isConfirm}
      style={{ touchAction: 'manipulation' }} 
      className="captcha-reset-btn"
    >
      Сбросить
    </button>
  );
};
