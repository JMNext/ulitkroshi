import React from "react";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";

export const SubmitButton = () => {
  const { rawPhone = "", sendPhone } = useRegistrationStep2Store();
  const isReady = rawPhone.length === 10;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    (document.activeElement as HTMLElement)?.blur?.();
    sendPhone();
  };

  return (
    <div className="pointer-events-auto relative flex h-[76px] w-[460px] shrink-0 origin-center items-center justify-center font-black select-none">
      <button
        type="button"
        disabled={!isReady}
        onClick={isReady ? handleClick : undefined}
        className={`box-border flex h-full w-full items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-6 text-[24px] font-black tracking-wide text-white uppercase ${
          isReady
            ? "cursor-pointer touch-manipulation shadow-md transition-transform duration-100 active:scale-95"
            : "cursor-not-allowed opacity-40 outline-none"
        }`}
      >
        Отправить
      </button>
    </div>
  );
};
