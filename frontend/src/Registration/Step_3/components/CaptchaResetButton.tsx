import { useRegistrationStep3Store } from "../store/useRegistrationStep3Store";

export const CaptchaResetButton = () => {
  const reset = useRegistrationStep3Store((s) => s.resetStore);

  return (
    <div className="animate-fade-in pointer-events-auto relative flex h-[54px] w-[340px] max-w-full shrink-0 origin-center items-center justify-center font-black transition-all duration-150 select-none">
      <button type="button" onClick={() => { (document.activeElement as HTMLElement)?.blur?.(); reset(true); }} className="box-border flex h-full w-full cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#ff5252] to-[#e63254] px-6 text-[20px] font-black tracking-wide whitespace-nowrap text-white uppercase shadow-md transition-all duration-100 ease-out outline-none active:scale-95">
        Сбросить
      </button>
    </div>
  );
};
