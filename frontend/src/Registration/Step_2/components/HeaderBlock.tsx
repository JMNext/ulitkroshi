import React, { useContext } from "react";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";
import { ReactLayoutContext } from "../Step2UiManager";

export const HeaderBlock = () => {
  const ctx = useContext(ReactLayoutContext);
  const {
    mode,
    secs,
    attempts,
    errorMessage,
    sendPhone,
    startTimer
  } = useRegistrationStep2Store();

  const handleResendClick = () => {
    if (secs <= 0) sendPhone().then(() => startTimer());
  };

  const titleStr =
    errorMessage ||
    (mode === "code"
      ? attempts > 0 && attempts < 3
        ? `Неверный код. Осталось попыток: ${3 - attempts}`
        : "Введи номер из смс!"
      : "Набери свой номер телефона!");

  const isTimerActive = secs > 0;

  return (
    <div className="relative flex h-[140px] w-[460px] shrink-0 items-center justify-center font-black pointer-events-none select-none transition-all duration-150 origin-center">
      <div className="box-border flex h-full w-full flex-col items-center justify-center rounded-[32px] border border-slate-200/50 bg-white p-6 text-center shadow-md">
        <h2 className={`m-0 text-[21px] leading-snug font-black ${errorMessage ? "text-red-500" : "text-slate-700"}`}>
          {titleStr}
        </h2>
        {mode === "code" && (
          <button
            type="button"
            onClick={handleResendClick}
            disabled={isTimerActive}
            className={`pointer-events-auto mt-2 touch-manipulation border-none bg-transparent text-[14px] font-black transition-colors outline-none select-none ${
              isTimerActive ? "cursor-not-allowed text-slate-400" : "cursor-pointer text-emerald-600 hover:text-emerald-700"
            }`}
          >
            {isTimerActive ? `Отправить повторно через ${secs} сек` : "Отправить повторно"}
          </button>
        )}
      </div>
    </div>
  );
};
