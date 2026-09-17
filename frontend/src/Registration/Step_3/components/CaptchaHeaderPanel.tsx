import { clsx } from "clsx";
import { useRegistrationStep3Store } from "../store/useRegistrationStep3Store";
import { FRUIT_URLS } from "./fruitAssets";

const MESSAGES = {
  systemError: "Ошибка проверки номера телефона.",
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
    registerMode,
    registerSel,
    registerAttempts,
    registerError
  } = useRegistrationStep3Store();

  const currentMode = isLogin ? loginMode : registerMode;
  const currentSelected = isLogin ? loginSel : registerSel;
  const currentAttempts = isLogin ? loginAttempts : registerAttempts;
  const currentError = isLogin ? loginError : registerError;

  const targetText =
    STATIC_MESSAGES[currentError ?? ""] ||
    (currentMode === "error" || currentAttempts >= 3
      ? MESSAGES.totalError
      : currentAttempts > 0
        ? MESSAGES.attemptsLeft(3 - currentAttempts)
        : isLogin
          ? MESSAGES.loginPrompt
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
          const resolvedUrl = hasFruit ? FRUIT_URLS[fruitId] : "";

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
