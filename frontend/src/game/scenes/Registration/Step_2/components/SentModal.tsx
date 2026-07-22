import { useRegistrationStep2Store } from '../useRegistrationStep2Store';

export const SentModal = () => {
  const { mode, setMode } = useRegistrationStep2Store();

  if (mode !== 'sent') return null;

  return (
    <div className="bg-white border-2 border-[#449103] rounded-[32px] shadow-2xl flex flex-col items-center justify-center text-center select-none box-border w-[360px] h-[210px] p-6 gap-y-4">
      <p className="font-black text-slate-700 leading-snug m-0 p-0 block text-[24px]">
        Отправили смс
        <br />
        на твой номер!
      </p>

      <button
        type="button"
        onClick={() => setMode('code')}
        className="uppercase rounded-full flex items-center justify-center border-b-4 border-b-[#366901] bg-gradient-to-b from-[#81c714] to-[#4c9203] shadow-md active:scale-95 transition-transform duration-100 outline-none box-border cursor-pointer select-none font-black text-white w-[160px] h-[52px] text-[20px]"
      >
        Ок!
      </button>
    </div>
  );
};
