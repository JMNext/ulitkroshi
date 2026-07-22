import { useRegistrationStep3Store } from '../useRegistrationStep3Store';

export const CaptchaResetButton = ({ onReset }: { onReset: () => void }) => {
  const isConfirm = useRegistrationStep3Store((state) => state.mode) === 'confirm';
  
  return (
    <button 
      type="button"
      onClick={onReset} 
      disabled={isConfirm}
      style={{ touchAction: 'manipulation' }} 
      className={`text-white font-extrabold rounded-2xl shadow-md box-border transition-all shrink-0 border-t-0 border-x-0 border-b-4 border-b-[#cd2b46] bg-[#e63956] active:scale-95 duration-100 ease-out outline-none select-none w-[340px] h-[54px] text-[20px] ${
        isConfirm 
          ? 'opacity-40 cursor-not-allowed pointer-events-none' 
          : 'cursor-pointer pointer-events-auto opacity-100'
      }`}
    >
      Сбросить
    </button>
  );
};
