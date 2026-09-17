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

// Карта статических текстовых состояний
const STATIC_MESSAGES: Record<string, string> = {
  system_error: MESSAGES.systemError,
  wrong_fruit: MESSAGES.wrongFruit,
  error: MESSAGES.totalError,
  confirm: MESSAGES.modeConfirm,
  verify: MESSAGES.modeVerify,
  select: MESSAGES.modeSelect
};

export const CaptchaHeaderPanel = () => {
  const { mode, sel: selected, attempts, errorMessage, isLogin } = useRegistrationStep3Store();

  // Декларативное и чистое вычисление текста без гигантского каскада тернаров
  const targetText =
    STATIC_MESSAGES[errorMessage ?? ""] ||
    (mode === "error" || attempts >= 3
      ? MESSAGES.totalError
      : attempts > 0
        ? MESSAGES.attemptsLeft(3 - attempts)
        : isLogin
          ? MESSAGES.loginPrompt
          : STATIC_MESSAGES[mode ?? ""] || MESSAGES.modeSelect);

  return (
    <div className="relative flex h-[190px] w-[424px] max-w-full shrink-0 flex-col items-center justify-between rounded-[32px] border border-slate-200/50 bg-white p-4 text-slate-700 shadow-md select-none">
      <h2 className="m-0 flex min-h-[44px] items-center justify-center text-center text-[18px] leading-snug font-black whitespace-pre-line">
        {targetText}
      </h2>

      <div className="mb-1 flex items-center justify-center gap-3">
        {/* Оптимизированный цикл на фиксированные 4 слота через нативный массив */}
        {[0, 1, 2, 3].map((i) => {
          const fruitId = selected[i];
          const hasFruit = fruitId !== undefined;
          const resolvedUrl = hasFruit ? FRUIT_URLS[fruitId] : "";

          return (
            <div
              key={i} // Упростили ключ до чистого индекса
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
