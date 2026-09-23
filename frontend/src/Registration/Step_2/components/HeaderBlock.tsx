import { clsx } from "clsx";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";

const MSG = {
  phone: "Набери свой номер телефона!", code: "Введи номер из смс!",
  system_error: "Ошибка проверки номера телефона.", expired: "Время действия кода истекло.",
  too_many_attempts: "Превышено количество попыток.", ready: "Отправить повторно",
  wrong: (left: number) => `Неверный код. Осталось попыток: ${left}`,
  timer: (s: number) => `Отправить повторно через ${s} сек`
} as const;

export const HeaderBlock = () => {
  const { isLogin, loginError, registerMode, registerSecs, registerAttempts, registerError, sendRegisterPhone, startRegisterTimer } = useRegistrationStep2Store();

  const mode = isLogin ? "phone" : registerMode;
  const err = isLogin ? loginError : registerError;
  const isErr = err && err !== "user_not_found";

  const title = isErr
    ? (MSG as any)[err ?? ""] || (err === "wrong_code" ? MSG.wrong(3 - (isLogin ? 0 : registerAttempts)) : mode === "code" ? MSG.code : MSG.phone)
    : mode === "code" ? MSG.code : MSG.phone;

  return (
    <div className="pointer-events-none relative flex h-[140px] w-[460px] shrink-0 origin-center items-center justify-center font-black transition-all duration-150 select-none">
      <div className="box-border flex h-full w-full flex-col items-center justify-center rounded-[32px] border border-slate-200/50 bg-white p-6 text-center shadow-md">
        <h2 className={clsx("m-0 text-[21px] leading-snug font-black whitespace-pre-line", isErr ? "text-red-500" : "text-slate-700")}>{title}</h2>
        {mode === "code" && (
          <button type="button" disabled={registerSecs > 0} onClick={async () => registerSecs <= 0 && (await sendRegisterPhone(), startRegisterTimer())} className={clsx("pointer-events-auto mt-2 touch-manipulation border-none bg-transparent text-[14px] font-black transition-colors outline-none", registerSecs > 0 ? "cursor-not-allowed text-slate-400" : "cursor-pointer text-emerald-600 hover:text-emerald-700")}>
            {registerSecs > 0 ? MSG.timer(registerSecs) : MSG.ready}
          </button>
        )}
      </div>
    </div>
  );
};
