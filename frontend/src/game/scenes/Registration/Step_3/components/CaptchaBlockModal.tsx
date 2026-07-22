// CaptchaBlockModal.tsx
import React from 'react';
import { useRegistrationStep3Store } from '../useRegistrationStep3Store';

interface CaptchaBlockModalProps {
  onReset: () => void;
}

export const CaptchaBlockModal = ({ onReset }: CaptchaBlockModalProps) => {
  const { setCaptchaState, generateNewOrder } = useRegistrationStep3Store();

  const handleFullReset = () => {
    useRegistrationStep3Store.setState({ attempts: 0, errorMessage: '' });
    generateNewOrder();
    setCaptchaState([], [], 'select', false);
    onReset();
  };

  return (
    <div className="absolute inset-0 m-auto bg-white border-2 border-red-500 rounded-[32px] shadow-2xl flex flex-col items-center justify-center text-center select-none box-border z-50 w-[360px] h-[210px] p-6 gap-y-4">
      <p className="font-black text-slate-700 leading-snug m-0 p-0 block text-[20px]">
        Код запутался.
        <br />
        Начнем сначала?
      </p>

      <button 
        type="button" 
        onClick={handleFullReset} 
        style={{ touchAction: 'manipulation' }} 
        className="uppercase rounded-full flex items-center justify-center border-b-4 border-b-[#c2410c] bg-gradient-to-b from-orange-500 to-amber-600 shadow-md active:scale-95 transition-transform duration-100 outline-none box-border cursor-pointer select-none font-black text-white w-[200px] h-[52px] text-[16px]"
      >
        Выбрать заново
      </button>
    </div>
  );
};
