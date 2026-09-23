import { useEffect } from "react";
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

export const CaptchaFruitGrid = ({ sessionId, onSuccess }: { sessionId: string; onSuccess: () => void }) => {
  const { isLogin, fruitOrder, loginMode, loginShake, loginAttempts, isLoginSubmitting, loginSel, toggleLoginSelect, step3Mode, registerShake, registerAttempts, isRegisterSubmitting, registerSel, toggleRegisterSelect } = useRegistrationStep3Store();

  const mode = isLogin ? loginMode : step3Mode;
  const shake = isLogin ? loginShake : registerShake;
  const attempts = isLogin ? loginAttempts : registerAttempts;
  const sub = isLogin ? isLoginSubmitting : isRegisterSubmitting;
  const selected = isLogin ? loginSel : registerSel;

  const disabled = mode === "error" || mode === "confirm" || sub || attempts >= 3;

  useEffect(() => { URLS.forEach(url => { const img = new Image(); img.src = url; }); }, []);

  const handleClick = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); e.stopPropagation();
    if (disabled) return;
    isLogin ? toggleLoginSelect(id, sessionId, onSuccess) : toggleRegisterSelect(id, sessionId, onSuccess);
  };

  return (
    <div className="pointer-events-none relative flex h-[424px] w-[424px] max-w-full shrink-0 origin-center items-center justify-center transition-all duration-150">
      <div className={clsx("box-border flex h-full w-full items-center justify-center transition-all duration-150", sub ? "opacity-40" : "opacity-100", shake && "animate-shake")}>
        <div className="box-border grid grid-cols-4 gap-4">
          {fruitOrder.map((id) => {
            const hasSel = selected.includes(id);
            const url = URLS[id >= 1 && id <= 16 ? id - 1 : id];

            return (
              <button key={id} type="button" disabled={disabled} onClick={(e) => handleClick(e, id)} className={clsx("pointer-events-auto box-border flex h-[94px] w-[94px] shrink-0 cursor-pointer touch-manipulation items-center justify-center overflow-hidden rounded-full border-4 bg-white p-0 transition-all outline-none active:scale-95", hasSel ? (shake ? "animate-shake border-red-500 bg-red-50 shadow-md" : "border-[#a6f034] shadow-md") : "border-slate-100 shadow-sm hover:border-sky-400 focus:border-sky-500 active:border-sky-600", disabled && "cursor-not-allowed opacity-80")}>
                {url && <img src={url} width="56" height="56" className="pointer-events-none block h-14 w-14 object-contain" alt="" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
