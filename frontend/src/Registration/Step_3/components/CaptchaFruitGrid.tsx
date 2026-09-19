import { clsx } from "clsx";
import { useEffect } from "react";
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

interface CaptchaFruitGridProps {
  sessionId: string;
  onSuccess: () => void;
}

export const CaptchaFruitGrid = ({ sessionId, onSuccess }: CaptchaFruitGridProps) => {
  const {
    isLogin,
    fruitOrder,
    loginMode,
    loginShake,
    loginAttempts,
    isLoginSubmitting,
    loginSel,
    toggleLoginSelect,
    step3Mode,
    registerShake,
    registerAttempts,
    isRegisterSubmitting,
    registerSel,
    toggleRegisterSelect,
    registerCorr
  } = useRegistrationStep3Store();

  const currentMode = isLogin ? loginMode : step3Mode;
  const currentShake = isLogin ? loginShake : registerShake;
  const currentAttempts = isLogin ? loginAttempts : registerAttempts;
  const currentSubmitting = isLogin ? isLoginSubmitting : isRegisterSubmitting;
  const currentSelected = isLogin ? loginSel : registerSel;

  const isGridDisabled =
    currentMode === "error" ||
    currentMode === "confirm" ||
    currentSubmitting ||
    currentAttempts >= 3;

  useEffect(() => {
    FRUIT_URLS.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  const handleFruitClick = (e: React.MouseEvent, fruitId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (isGridDisabled) return;

    if (isLogin) {
      toggleLoginSelect(fruitId, sessionId, onSuccess);
    } else {
      console.log(`[GRID CLICK] Выбран fruitId: ${fruitId} | Эталон в памяти:`, registerCorr, `| Текущий набор:`, [...registerSel, fruitId]);
      toggleRegisterSelect(fruitId, sessionId, onSuccess);
    }
  };

  return (
    <div className="pointer-events-none relative flex h-[424px] w-[424px] max-w-full shrink-0 origin-center items-center justify-center transition-all duration-150">
      <div
        className={clsx(
          "box-border flex h-full w-full items-center justify-center transition-all duration-150",
          currentSubmitting ? "opacity-40" : "opacity-100",
          currentShake && "animate-shake"
        )}
      >
        <div className="box-border grid grid-cols-4 gap-4">
          {fruitOrder.map((fruitId) => {
            const isSelected = currentSelected.includes(fruitId);
            const resolvedUrl = fruitId >= 1 && fruitId <= 16 ? FRUIT_URLS[fruitId - 1] : FRUIT_URLS[fruitId];

            return (
              <button
                key={fruitId}
                type="button"
                disabled={isGridDisabled}
                onClick={(e) => handleFruitClick(e, fruitId)}
                className={clsx(
                  "pointer-events-auto box-border flex h-[94px] w-[94px] shrink-0 cursor-pointer touch-manipulation items-center justify-center overflow-hidden rounded-full border-4 bg-white p-0 transition-all outline-none active:scale-95",
                  isSelected
                    ? currentShake
                      ? "animate-shake border-red-500 bg-red-50 shadow-md"
                      : "border-[#a6f034] shadow-md"
                    : "border-slate-100 shadow-sm hover:border-sky-400 focus:border-sky-500 active:border-sky-600",
                  isGridDisabled && "cursor-not-allowed opacity-80"
                )}
              >
                {resolvedUrl && (
                  <img
                    src={resolvedUrl}
                    width="56"
                    height="56"
                    className="pointer-events-none block h-14 w-14 object-contain"
                    alt=""
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
