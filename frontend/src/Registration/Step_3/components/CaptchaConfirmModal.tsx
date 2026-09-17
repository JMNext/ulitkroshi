import { useRegistrationStep3Store } from "../store/useRegistrationStep3Store";

const MESSAGES = {
  title: "Запомнил?",
  btnConfirm: "ДА!"
} as const;

export const CaptchaConfirmModal = () => {
  const saveFirstStep = useRegistrationStep3Store((state) => state.saveFirstStep);

  const handleConfirmClick = () => {
    (document.activeElement as HTMLElement)?.blur?.();
    saveFirstStep();
  };

  return (
    <div className="animate-fade-in pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="pointer-events-auto box-border flex w-[340px] max-w-full flex-col items-center justify-center gap-5 rounded-[28px] border-2 border-[#81c714] bg-white px-5 py-6 text-center shadow-2xl landscape:gap-4 landscape:py-5">
        <h3 className="m-0 w-full text-xl leading-snug font-black text-slate-700 normal-case select-none landscape:text-base">
          {MESSAGES.title}
        </h3>
        <button
          type="button"
          onClick={handleConfirmClick}
          className="flex h-12 w-[160px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-4 text-base font-black tracking-wide whitespace-nowrap text-white uppercase shadow-md transition-transform outline-none select-none active:scale-95"
        >
          {MESSAGES.btnConfirm}
        </button>
      </div>
    </div>
  );
};
