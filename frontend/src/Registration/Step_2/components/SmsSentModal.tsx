import { clsx } from "clsx";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";

const MESSAGES = {
  title: "Отправили смс\nна твой номер!",
  btnOk: "ОК!"
} as const;

export const SmsSentModal = () => {
  const { confirmRegisterSent } = useRegistrationStep2Store();

  const handleOkClick = () => {
    (document.activeElement as HTMLElement)?.blur?.();
    confirmRegisterSent();
  };

  return (
    <div className="animate-fade-in pointer-events-none absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
      <div
        className={clsx(
          "pointer-events-auto box-border flex w-[340px] max-w-full flex-col items-center justify-center gap-5 rounded-[28px] border-2 bg-white px-5 py-6 text-center shadow-2xl landscape:gap-4 landscape:py-5",
          "border-[#81c714]"
        )}
      >
        <div className="box-border flex w-full flex-col items-center justify-center gap-5">
          <h3 className="m-0 w-full text-xl leading-snug font-black whitespace-pre-line text-slate-700 normal-case select-none">
            {MESSAGES.title}
          </h3>
          <button
            type="button"
            onClick={handleOkClick}
            className="flex h-12 w-[160px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-4 text-base font-black whitespace-nowrap text-white uppercase shadow-md transition-transform outline-none select-none active:scale-95"
          >
            {MESSAGES.btnOk}
          </button>
        </div>
      </div>
    </div>
  );
};
