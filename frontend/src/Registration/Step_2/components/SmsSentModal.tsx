import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";

export const SmsSentModal = () => {
  const { confirmRegisterSent } = useRegistrationStep2Store();

  return (
    <div className="animate-fade-in pointer-events-none absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
      <div className="pointer-events-auto box-border flex w-[340px] max-w-full flex-col items-center justify-center gap-5 rounded-[28px] border-2 border-[#81c714] bg-white px-5 py-6 text-center shadow-2xl landscape:gap-4 landscape:py-5">
        <h3 className="m-0 text-xl leading-snug font-black whitespace-pre-line text-slate-700 select-none">
          {`Отправили смс\nна твой номер!`}
        </h3>
        <button
          type="button"
          onClick={() => {
            (document.activeElement as HTMLElement)?.blur?.();
            confirmRegisterSent();
          }}
          className="flex h-12 w-[160px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-4 text-base font-black text-white uppercase shadow-md transition-transform outline-none select-none active:scale-95"
        >
          ОК!
        </button>
      </div>
    </div>
  );
};
