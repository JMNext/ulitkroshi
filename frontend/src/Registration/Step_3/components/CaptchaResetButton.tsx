import React from "react";
import { useRegistrationStep3Store } from "../store/useRegistrationStep3Store";

export const CaptchaResetButton = () => {
  const resetStore = useRegistrationStep3Store((state) => state.resetStore);

  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    resetStore(true);
  };

  return (
    <div className="relative flex h-[54px] w-[340px] max-w-full shrink-0 items-center justify-center font-black pointer-events-auto select-none transition-all duration-150 animate-fade-in origin-center">
      <button
        type="button"
        onClick={handleResetClick}
        className="box-border flex h-full w-full cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#ff5252] to-[#e63254] px-6 text-[20px] font-black tracking-wide text-white uppercase shadow-md outline-none transition-all duration-100 ease-out active:scale-95 whitespace-nowrap"
      >
        Сбросить
      </button>
    </div>
  );
};
