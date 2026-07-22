import { useRegistrationStep2Store } from '../useRegistrationStep2Store';

export const SubmitButton = () => {
  const mode = useRegistrationStep2Store(s => s.mode);
  const rawPhone = useRegistrationStep2Store(s => s.rawPhone);
  const sendPhone = useRegistrationStep2Store(s => s.sendPhone);

  if (mode !== 'phone') return null;

  const isReady: boolean = rawPhone.trim().length === 10;

  return (
    <button 
      type="button"
      onClick={() => isReady && sendPhone()} 
      disabled={!isReady} 
      className={`text-white font-black rounded-full border-t-0 border-x-0 border-b-4 border-b-[#366901] bg-gradient-to-b from-[#81c714] to-[#4c9203] shadow-md transition-all duration-100 ease-out box-border select-none w-[540px] h-[90px] text-[22px] ${
        isReady 
          ? 'active:scale-95 cursor-pointer pointer-events-auto opacity-100' 
          : 'opacity-40 cursor-not-allowed pointer-events-none'
      }`}
    >
      Отправить
    </button>
  );
};
