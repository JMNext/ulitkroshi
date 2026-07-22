import { useRegistrationStep3Store } from '../useRegistrationStep3Store';

export const CaptchaConfirmModal = ({ onConfirm }: { onConfirm: () => void }) => {
  const saveFirstStep = useRegistrationStep3Store((s) => s.saveFirstStep);

  const handleConfirm = () => {
    saveFirstStep(); // Стор сам всё запишет и перемешает
    onConfirm();     // Закрываем модалку/вызываем коллбек компонента
  };

  return (
    <div className="bg-white border-2 border-[#449103] rounded-[36px] shadow-2xl flex flex-col items-center justify-center text-center select-none box-border w-[400px] h-[250px] p-8 gap-y-5">
      <p className="font-black text-slate-700 leading-snug m-0 p-0 block text-[26px]">
        Запомнил?
      </p>

      <button 
        type="button"
        onClick={handleConfirm} 
        style={{ touchAction: 'manipulation' }} 
        className="uppercase rounded-full flex items-center justify-center border-b-4 border-b-[#366901] bg-gradient-to-b from-[#81c714] to-[#4c9203] shadow-md active:scale-95 transition-transform duration-100 outline-none box-border cursor-pointer select-none font-black text-white w-[180px] h-[56px] text-[22px]"
      >
        Да!
      </button>
    </div>
  );
};
