import React from 'react';

interface CaptchaResetButtonProps {
  mode: 'select' | 'confirm' | 'verify' | 'error';
  onReset: () => void;
}

export const CaptchaResetButton = ({ mode, onReset }: CaptchaResetButtonProps) => {
  const isConfirm = mode === 'confirm';

  return (
    <button 
      onClick={onReset} 
      style={{ touchAction: 'manipulation' }} 
      className={`w-[240px] h-11 text-white font-extrabold text-xl rounded-2xl border-b-4 border-[#cd2b46] bg-[#e63956] shadow-md cursor-pointer mt-8 box-border transition-all ${
        isConfirm ? 'opacity-40 pointer-events-none' : 'active:translate-y-[2px] active:border-b-2'
      }`}
    >
      Сбросить
    </button>
  );
};
