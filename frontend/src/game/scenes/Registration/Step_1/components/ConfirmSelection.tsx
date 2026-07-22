import { useRegistrationStep1Store } from '../useRegistrationStep1Store';

export const ConfirmSelection = () => {
  const { stage, setStage } = useRegistrationStep1Store();

  if (stage !== 2) return null;

  return (
    <div className="bg-white flex shadow-lg items-center justify-between box-border rounded-full border-4 border-[#81c714] shrink-0 w-[460px] gap-4 p-[10px_12px]">
      <button 
        type="button"
        onClick={() => setStage(1)} 
        className="flex-1 font-black text-white bg-gradient-to-b from-[#ff5252] to-[#e63254] flex items-center justify-center border-none uppercase tracking-wide active:scale-95 transition-all duration-100 ease-out outline-none rounded-full text-[24px] px-8 py-3"
      >
        Нет
      </button>
      <button 
        type="button"
        onClick={() => setStage(4)} 
        className="flex-1 font-black text-white bg-gradient-to-b from-[#81c714] to-[#60aa05] flex items-center justify-center border-none uppercase tracking-wide active:scale-95 transition-all duration-100 ease-out outline-none rounded-full text-[24px] px-8 py-3"
      >
        Да!
      </button>
    </div>
  );
};
