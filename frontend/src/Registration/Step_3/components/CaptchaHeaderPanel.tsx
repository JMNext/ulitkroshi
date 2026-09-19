import { clsx } from "clsx";
import { useRegistrationStep3Store } from "../store/useRegistrationStep3Store";

import fruit01 from "@/assets/fruits/fruits_01.png";
import fruit02 from "@/assets/fruits/fruits_02.png";
import fruit03 from "@/assets/fruits/fruits_03.png";
import fruit04 from "@/assets/fruits/fruits_04.png";
import fruit05 from "@/assets/fruits/fruits_05.png";
import fruit06 from "@/assets/fruits/fruits_06.png";
import fruit07 from "@/assets/fruits/fruits_07.png";
import fruit08 from "@/assets/fruits/fruits_08.png";
import fruit09 from "@/assets/fruits/fruits_09.png";
import fruit10 from "@/assets/fruits/fruits_10.png";
import fruit11 from "@/assets/fruits/fruits_11.png";
import fruit12 from "@/assets/fruits/fruits_12.png";
import fruit13 from "@/assets/fruits/fruits_13.png";
import fruit14 from "@/assets/fruits/fruits_14.png";
import fruit15 from "@/assets/fruits/fruits_15.png";
import fruit16 from "@/assets/fruits/fruits_16.png";

const FRUIT_URLS: string[] = [
  fruit01, fruit02, fruit03, fruit04, fruit05, fruit06, fruit07, fruit08,
  fruit09, fruit10, fruit11, fruit12, fruit13, fruit14, fruit15, fruit16
];

const MESSAGES = {
  systemError: "Ошибка сервера при сохранении пароля.",
  wrongFruit: "Ошибка ввода, попробуй еще раз.",
  totalError: "Что-то не так, давай\nеще раз!",
  loginPrompt: "Введи свой фруктовый пароль!",
  modeConfirm: "Запомнил?",
  modeVerify: "А теперь повтори фрукты,\nкоторые ты выбрал!",
  modeSelect: "Придумай фруктовый код\nи запомни его!",
  attemptsLeft: (left: number) => `Неверный порядок.\nОсталось попыток: ${left}`
} as const;

const STATIC_MESSAGES: Record<string, string> = {
  system_error: MESSAGES.systemError,
  server_error: MESSAGES.systemError,
  wrong_fruit: MESSAGES.wrongFruit,
  error: MESSAGES.totalError,
  confirm: MESSAGES.modeConfirm,
  verify: MESSAGES.modeVerify,
  select: MESSAGES.modeSelect
};

export const CaptchaHeaderPanel = () => {
  const {
    isLogin,
    loginMode,
    loginSel,
    loginAttempts,
    loginError,
    step3Mode,
    registerSel,
    registerAttempts,
    step3Error
  } = useRegistrationStep3Store();

  const currentMode = isLogin ? loginMode : step3Mode;
  const currentSelected = isLogin ? loginSel : registerSel;
  const currentAttempts = isLogin ? loginAttempts : registerAttempts;
  const currentError = isLogin ? loginError : step3Error;

  const targetText =
    STATIC_MESSAGES[currentError ?? ""] ||
    (currentMode === "error" || currentAttempts >= 3
      ? MESSAGES.totalError
      : currentAttempts > 0
        ? MESSAGES.attemptsLeft(3 - currentAttempts)
        : isLogin
          ? MESSAGES.loginPrompt
          : currentMode === "select"
            ? MESSAGES.modeSelect
            : STATIC_MESSAGES[currentMode ?? ""] || MESSAGES.modeSelect);

  return (
    <div className="relative flex h-[190px] w-[424px] max-w-full shrink-0 flex-col items-center justify-between rounded-[32px] border border-slate-200/50 bg-white p-4 text-slate-700 shadow-md select-none">
      <h2 className="m-0 flex min-h-[44px] items-center justify-center text-center text-[18px] leading-snug font-black whitespace-pre-line">
        {targetText}
      </h2>

      <div className="mb-1 flex items-center justify-center gap-3">
        {[0, 1, 2, 3].map((i) => {
          const fruitId = currentSelected[i];
          const hasFruit = fruitId !== undefined;
          const resolvedUrl = hasFruit && fruitId >= 1 && fruitId <= 16 ? FRUIT_URLS[fruitId - 1] : "";

          return (
            <div
              key={i}
              className={clsx(
                "box-border flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-full border",
                hasFruit ? "border-slate-100 bg-[#f9fafb] shadow-md" : "border-slate-200 bg-[#f5f5f4] shadow-inner"
              )}
            >
              {resolvedUrl && (
                <img
                  src={resolvedUrl}
                  width="40"
                  height="40"
                  className="pointer-events-none block h-10 w-10 object-contain"
                  alt=""
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
