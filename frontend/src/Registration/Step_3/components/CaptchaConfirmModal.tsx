import { useRegistrationStep3Store } from "../store/useRegistrationStep3Store";

export const CaptchaConfirmModal = () => {
  const save = useRegistrationStep3Store((s) => s.saveFirstStep);

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof document !== "undefined" && document.activeElement) {
      (document.activeElement as HTMLElement)?.blur?.();
    }

    save();
  };

  return (

    <div className="animate-fade-in pointer-events-auto absolute top-1/2 left-1/2 z-[999] -translate-x-1/2 -translate-y-1/2">
      <div
        className="box-border flex w-[340px] max-w-full flex-col items-center justify-center gap-5 rounded-[28px] border-2 border-[#81c714] bg-white px-5 py-6 text-center shadow-2xl landscape:gap-4 landscape:py-5"
      >
        <h3 className="m-0 w-full text-xl leading-snug font-black text-slate-700 select-none landscape:text-base">
          Запомнил?
        </h3>
        <button
          type="button"
          onClick={handleConfirm}
          className="cursor-pointer flex h-12 w-[160px] shrink-0 touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-4 text-base font-black whitespace-nowrap text-white uppercase shadow-md transition-transform outline-none select-none active:scale-95"
        >
          ДА!
        </button>
      </div>
    </div>
  );
};
