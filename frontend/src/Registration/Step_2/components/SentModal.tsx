import React from "react";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";

export const SentModal = () => {
  const setMode = useRegistrationStep2Store((state) => state.setMode);

  const handleOkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setMode("code");
  };

  return (
    <div className="absolute left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-fade-in">
      <div className="pointer-events-auto box-border flex w-[340px] max-w-full flex-col items-center justify-center gap-5 rounded-[28px] border-2 border-[#81c714] bg-white px-5 py-6 text-center shadow-2xl landscape:py-5 landscape:gap-4">
        <h3 className="m-0 text-xl font-black text-slate-700 select-none leading-snug w-full normal-case landscape:text-base">
          Отправили смс<br />на твой номер!
        </h3>
        <button
          type="button"
          onClick={handleOkClick}
          className="flex h-12 w-[160px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-4 text-base font-black tracking-wide text-white uppercase shadow-md outline-none select-none transition-transform active:scale-95 whitespace-nowrap"
        >
          ОК!
        </button>
      </div>
    </div>
  );
};
