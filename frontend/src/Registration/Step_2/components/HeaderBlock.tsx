import React from "react";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";

const MESSAGES = {
  enterPhone: "Набери свой номер телефона!",
  enterCode: "Введи номер из смс!",
  systemError: "Ошибка проверки номера телефона.",
  codeExpired: "Время действия кода истекло.",
  tooManyAttempts: "Превышено количество попыток.",
  wrongCode: (left: number) => `Неверный код. Осталось попыток: ${left}`,
  resendWithTimer: (secs: number) => `Отправить повторно через ${secs} сек`,
  resendReady: "Отправить повторно"
};

export const HeaderBlock = () => {
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

  const isTimerActive = secs > 0;

  let titleStr = mode === "code" ? MESSAGES.enterCode : MESSAGES.enterPhone;

  if (errorMessage === "system_error") {
    titleStr = MESSAGES.systemError;
  } else if (errorMessage === "expired") {
    titleStr = MESSAGES.codeExpired;
  } else if (errorMessage === "too_many_attempts") {
    titleStr = MESSAGES.tooManyAttempts;
  } else if (errorMessage === "wrong_code") {
    titleStr = MESSAGES.wrongCode(3 - attempts);
  }

  return (
    <div className="relative flex h-[140px] w-[460px] shrink-0 items-center justify-center font-black pointer-events-none select-none transition-all duration-150 origin-center">
      <div className="box-border flex h-full w-full flex-col items-center justify-center rounded-[32px] border border-slate-200/50 bg-white p-6 text-center shadow-md">
        <h2 className={`m-0 text-[21px] leading-snug font-black whitespace-pre-line ${errorMessage && errorMessage !== "user_not_found" ? "text-red-500" : "text-slate-700"}`}>
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
            {isTimerActive ? MESSAGES.resendWithTimer(secs) : MESSAGES.resendReady}
          </button>
        )}
      </div>
    </div>
  );
};
