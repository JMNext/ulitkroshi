import { useState, useEffect } from "react";
import { clsx } from "clsx";
import lifeImgUrl from "@/assets/interface-icons/life.svg";
import { ACTION_ANIMATIONS } from "./constants/petCharacter.constants";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

interface PetIndicatorsProps {
  petName: string;
  hp: number;
  currentAnim: string;
  alertText: string | null;
}

const EMOJI_MAP: Record<string, string> = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const PetIndicators = ({ petName, hp, currentAnim, alertText }: PetIndicatorsProps) => {
  const isLow = hp <= 25;
  const safeHp = Math.min(Math.max(hp, 0), 100);

  const { mood = "happy", buffUntil = 0 } = usePetStore();

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => setTimeLeft(Math.max(0, Math.floor((buffUntil - Date.now()) / 1000)));
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [buffUntil]);

  const hasBuff = timeLeft > 0;
  const currentEmoji = EMOJI_MAP[mood] || "😊";

  const borderColor = isLow ? "border-red-500" : "border-[#ffca28]";
  const circleClass = clsx("absolute z-20 flex items-center justify-center h-[38px] w-[38px] rounded-full border-[3px] border-solid bg-white/95 transition-all duration-150 shadow-sm", borderColor);

  const nameLength = petName?.length || 0;
  const fontSizeClass = nameLength > 15 ? "text-[20px]" : nameLength > 10 ? "text-[24px]" : "text-[30px]";

  const shouldHide = ACTION_ANIMATIONS.includes(currentAnim) || !!alertText;

  return (
    <div
      className={clsx(
        "pointer-events-none flex w-[380px] max-w-[90vw] flex-col items-center justify-center transition-opacity duration-200 select-none",
        shouldHide ? "invisible opacity-0" : "visible opacity-100"
      )}
    >
      {/* Имя питомца и активный бафф */}
      <div className="mb-1.5 flex min-h-[42px] w-full flex-wrap items-center justify-center gap-3 px-2">
        <span
          className={clsx(
            "max-w-[75%] text-center font-black text-[#1a3d1c] drop-shadow-[0_2px_0_rgba(255,255,255,1)] leading-tight break-words",
            fontSizeClass
          )}
        >
          {petName}
        </span>

        {hasBuff && (
          <div className="flex items-center gap-1.5 shrink-0 animate-fade-in bg-emerald-50/95 border border-emerald-500/40 rounded-full pl-1.5 pr-2.5 py-0.5 shadow-md origin-center">
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full border-[2px] border-solid border-emerald-500 bg-white shadow-sm">
              <span className="text-[14px] leading-none">💪</span>
            </div>
            <span className="text-[14px] font-black text-emerald-800 drop-shadow-[0_1px_0_rgba(255,255,255,1)] tabular-nums tracking-wide leading-none">
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Статус здоровья: сердечко + шкала HP + смайлик настроения */}
      <div className="relative flex items-center justify-center h-[42px] w-[280px]">
        <div className={clsx(circleClass, "left-[-14px]", isLow && "bg-red-50")}>
          <img
            src={lifeImgUrl}
            className={clsx("pointer-events-none block h-[22px] w-[22px] object-contain", isLow && "animate-pulse")}
            alt="HP"
          />
        </div>

        <div
          className={clsx(
            "absolute left-0 right-0 box-border flex flex-col justify-center rounded-[14px] border-[3px] border-solid overflow-hidden bg-[#e8f5e9] z-10 shadow-[0_4px_10px_rgba(0,0,0,0.08)] transition-all duration-150 h-[34px]",
            borderColor
          )}
        >
          <div className="relative h-full w-full overflow-hidden">
            <div
              className={clsx(
                "h-full transition-all duration-300 shadow-[inset_0_-2px_3px_rgba(0,0,0,0.15)] bg-gradient-to-r",
                isLow ? "from-red-500 to-red-400" : "from-[#4caf50] to-[#81c784]"
              )}
              style={{ width: `${safeHp}%` }}
            />
          </div>
        </div>

        <div className={clsx(circleClass, "right-[-14px]")}>
          <span className="text-[22px] leading-none flex items-center justify-center h-full w-full">
            {currentEmoji}
          </span>
        </div>
      </div>

      {/* Процент HP */}
      <span className={clsx(
        "mt-1 text-center text-[22px] font-black drop-shadow-[0_2px_0_rgba(255,255,255,1)]",
        isLow ? "animate-bounce text-red-600" : "text-[#1a3d1c]"
      )}>
        {hp}%
      </span>
    </div>
  );
};
