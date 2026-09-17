import { clsx } from "clsx";
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
} as const;

const ERROR_MESSAGES: Record<string, string> = {
  system_error: MESSAGES.systemError,
  expired: MESSAGES.codeExpired,
  too_many_attempts: MESSAGES.tooManyAttempts
};

export const HeaderBlock = () => {
  const {
    isLogin,
    loginError,
    registerMode,
    registerSecs,
    registerAttempts,
    registerError,
    sendRegisterPhone,
    startRegisterTimer
  } = useRegistrationStep2Store();

  const currentMode = isLogin ? "phone" : registerMode;
  const currentError = isLogin ? loginError : registerError;
  const currentAttempts = isLogin ? 0 : registerAttempts;

  const handleResendClick = async () => {
    if (registerSecs <= 0) {
      await sendRegisterPhone();
      startRegisterTimer();
    }
  };

  const isTimerActive = registerSecs > 0;
  const isRealError = currentError && currentError !== "user_not_found";

  const titleStr = isRealError
    ? (ERROR_MESSAGES[currentError ?? ""] ||
      (currentError === "wrong_code" ? MESSAGES.wrongCode(3 - currentAttempts) :
      (currentMode === "code" ? MESSAGES.enterCode : MESSAGES.enterPhone)))
    : (currentMode === "code" ? MESSAGES.enterCode : MESSAGES.enterPhone);

  return (
    <div className="pointer-events-none relative flex h-[140px] w-[460px] shrink-0 origin-center items-center justify-center font-black transition-all duration-150 select-none">
      <div className="box-border flex h-full w-full flex-col items-center justify-center rounded-[32px] border border-slate-200/50 bg-white p-6 text-center shadow-md">
        <h2
          className={clsx(
            "m-0 text-[21px] leading-snug font-black whitespace-pre-line",
            isRealError ? "text-red-500" : "text-slate-700"
          )}
        >
          {titleStr}
        </h2>
        {currentMode === "code" && (
          <button
            type="button"
            onClick={handleResendClick}
            disabled={isTimerActive}
            className={clsx(
              "pointer-events-auto mt-2 touch-manipulation border-none bg-transparent text-[14px] font-black transition-colors outline-none select-none",
              isTimerActive ? "cursor-not-allowed text-slate-400" : "cursor-pointer text-emerald-600 hover:text-emerald-700"
            )}
          >
            {isTimerActive ? MESSAGES.resendWithTimer(registerSecs) : MESSAGES.resendReady}
          </button>
        )}
      </div>
    </div>
  );
};
