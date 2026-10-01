import { clsx } from "clsx";
import { useRegistrationStep3Store } from "../store/useRegistrationStep3Store";
import f1 from "@/assets/fruits/fruits_01.png"; import f2 from "@/assets/fruits/fruits_02.png";
import f3 from "@/assets/fruits/fruits_03.png"; import f4 from "@/assets/fruits/fruits_04.png";
import f5 from "@/assets/fruits/fruits_05.png"; import f6 from "@/assets/fruits/fruits_06.png";
import f7 from "@/assets/fruits/fruits_07.png"; import f8 from "@/assets/fruits/fruits_08.png";
import f9 from "@/assets/fruits/fruits_09.png"; import f10 from "@/assets/fruits/fruits_10.png";
import f11 from "@/assets/fruits/fruits_11.png"; import f12 from "@/assets/fruits/fruits_12.png";
import f13 from "@/assets/fruits/fruits_13.png"; import f14 from "@/assets/fruits/fruits_14.png";
import f15 from "@/assets/fruits/fruits_15.png"; import f16 from "@/assets/fruits/fruits_16.png";

const URLS = [f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14, f15, f16];
const SYS_ERR = "Ошибка сервера при сохранении пароля.";
const MAP: Record<string, string> = { system_error: SYS_ERR, server_error: SYS_ERR, wrong_fruit: "Ошибка ввода, попробуй еще раз.", error: "Что-то не так, давай\nеще раз!", confirm: "Запомнил?", verify: "А теперь повтори фрукты,\nкоторые ты выбрал!", select: "Придумай фруктовый код\nи запомни его!" };

export const CaptchaHeaderPanel = () => {
  const { isLogin, loginMode, loginSel, loginAttempts, loginError, step3Mode, registerSel, registerAttempts, step3Error, removeLastFruit } = useRegistrationStep3Store();

  const mode = isLogin ? loginMode : step3Mode;
  const att = isLogin ? loginAttempts : registerAttempts;
  const err = isLogin ? loginError : step3Error;

  const txt = MAP[err ?? ""] || (mode === "error" || att >= 3 ? "Что-то не так, давай\nеще раз!" : att > 0 ? `Неверный порядок.\nОсталось попыток: ${3 - att}` : isLogin ? "Введи свой фруктовый пароль!" : MAP[mode ?? ""] || "Придумай фруктовый код\nи запомни его!");

  return (
    <div className="relative flex h-[190px] w-[424px] max-w-full shrink-0 flex-col items-center justify-between rounded-[32px] border border-slate-200/50 bg-white p-4 text-slate-700 shadow-md select-none">
      <h2 className="m-0 flex min-h-[44px] items-center justify-center text-center text-[18px] leading-snug font-black whitespace-pre-line">{txt}</h2>
      <div className="mb-1 flex items-center justify-center gap-3">
        {[0, 1, 2, 3].map((i) => {
          const sel = isLogin ? loginSel : registerSel;
          const fId = sel[i];
          const isLast = fId !== undefined && i === sel.length - 1;
          const url = fId !== undefined && fId >= 1 && fId <= 16 ? URLS[fId - 1] : "";

          return (
            <div
              key={i}
              onClick={isLast ? removeLastFruit : undefined}
              title={isLast ? "Нажмите, чтобы убрать фрукт" : undefined}
              className={clsx(
                "box-border flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-full border transition-all duration-150 select-none",
                fId !== undefined ? "border-slate-100 bg-[#f9fafb] shadow-md" : "border-slate-200 bg-[#f5f5f4] shadow-inner",
                isLast && "cursor-pointer touch-manipulation hover:border-amber-400 hover:scale-105 active:scale-95 ring-2 ring-transparent hover:ring-amber-300"
              )}
            >
              {url && <img src={url} width="40" height="40" className="pointer-events-none block h-10 w-10 object-contain" alt="" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
