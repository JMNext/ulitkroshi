import React from "react";
import { useRegistrationStep3Store } from "../store/useRegistrationStep3Store";
import { FRUIT_URLS } from "./fruitAssets";

export const CaptchaHeaderPanel = () => {
  const { mode, sel: selected = [], attempts, errorMessage, isLogin } = useRegistrationStep3Store();

  let targetText = errorMessage;

  if (!targetText) {
    if (mode === "error") {
      targetText = "Что-то не так, давай\nеще раз!";
    } else if (attempts > 0) {
      targetText = `Неверный порядок.\nОсталось попыток: ${3 - attempts}`;
    } else if (isLogin) {
      targetText = "Введи свой фруктовый пароль!";
    } else {
      targetText = mode === "confirm" 
        ? "Запомнил?" 
        : mode === "verify" 
          ? "А теперь повтори фрукты,\nкоторые ты выбрал!" 
          : "Придумай фруктовый код\nи запомни его!";
    }
  }

  return (
    <div className="relative flex h-[190px] w-[424px] max-w-full shrink-0 flex-col items-center justify-between rounded-[32px] border border-slate-200/50 bg-white p-4 text-slate-700 shadow-md select-none">
      <h2 className="m-0 flex min-h-[44px] items-center justify-center text-center text-[18px] leading-snug font-black whitespace-pre-line">
        {targetText}
      </h2>
      <div className="mb-1 flex items-center justify-center gap-3">
        {Array.from({ length: 4 }).map((_, i) => {
          const fruitId = selected[i];
          const resolvedUrl = fruitId ? FRUIT_URLS[fruitId] : "";

          return (
            <div
              key={`header-slot-${i}`}
              className={`box-border flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-full ${
                fruitId
                  ? "border border-slate-100 bg-[#f9fafb] shadow-md"
                  : "border border-slate-200 bg-[#f5f5f4] shadow-inner"
              }`}
            >
              {resolvedUrl && (
                <img
                  src={resolvedUrl}
                  width="40"
                  height="40"
                  className="pointer-events-none block h-10 w-10 object-contain"
                  alt=""
                  loading="lazy"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
