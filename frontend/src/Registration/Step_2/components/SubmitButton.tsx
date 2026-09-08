import React, { useContext } from "react";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";
import { ReactLayoutContext } from "../Step2UiManager";

export const SubmitButton = () => {
  const ctx = useContext(ReactLayoutContext);
  const { rawPhone = "", sendPhone } = useRegistrationStep2Store();
  const isReady = rawPhone.length === 10;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    sendPhone();
  };

  return (
    <div className="relative flex h-[76px] w-[460px] shrink-0 items-center justify-center font-black pointer-events-auto select-none transition-all duration-150 origin-center">
      <button
        type="button"
        disabled={!isReady}
        onClick={isReady ? handleClick : undefined}
        className={`box-border flex h-full w-full items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-6 text-[24px] font-black tracking-wide text-white uppercase select-none ${
          isReady
            ? "cursor-pointer touch-manipulation shadow-md transition-all duration-100 ease-out active:scale-95"
            : "cursor-not-allowed opacity-40 outline-none"
        }`}
      >
        Отправить
      </button>
    </div>
  );
};
