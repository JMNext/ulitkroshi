import { useState, useEffect } from "react";
import { clsx } from "clsx";
import lifeImgUrl from "@/assets/interface-icons/life.svg";
import { ACTION_ANIMATIONS } from "./constants/petCharacter.constants";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

interface PetIndicatorsProps {
  petName: string;
  hp: number;
  currentAnim: string;
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

export const PetIndicators = ({ petName, hp, currentAnim }: PetIndicatorsProps) => {
  const isLow = hp <= 25;
  const safeHp = Math.min(Math.max(hp, 0), 100);

  const { mood = "happy", experience = 45, stars = 1, buffUntil = 0 } = usePetStore();
  const isMaxStars = stars >= 5;

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
  const circleClass = clsx("absolute z-20 flex items-center justify-center h-[42px] w-[42px] rounded-full border-[3px] border-solid bg-white/95 transition-all duration-150", borderColor);

  return (
    <div
      className={clsx(
        "pointer-events-none absolute top-[-20px] left-1/2 flex w-[390px] -translate-x-1/2 flex-col items-center justify-center transition-all duration-150 select-none",
        ACTION_ANIMATIONS.includes(currentAnim) ? "invisible opacity-0" : "visible opacity-100"
      )}
    >
      <div className="mb-2 flex min-h-[48px] w-full items-center justify-center gap-3 px-4">
        <span className="max-w-[220px] overflow-hidden text-center text-[32px] font-black text-ellipsis whitespace-nowrap text-[#1a3d1c] drop-shadow-[0_2px_0_rgba(255,255,255,1)]">
          {petName}
        </span>

        {hasBuff && (
          <div className="flex items-center gap-1.5 shrink-0 animate-fade-in bg-emerald-50/90 border border-emerald-500/30 rounded-full pl-1 pr-2.5 py-0.5 shadow-sm">
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-solid border-emerald-500 bg-white">
              <span className="text-[14px] leading-none">💪</span>
            </div>
            <span className="text-[12px] font-black text-emerald-700 drop-shadow-[0_1px_0_rgba(255,255,255,1)] tabular-nums leading-noneLater">
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      <div className="relative flex items-center justify-center h-[52px] w-[300px]">
        <div className={clsx(circleClass, "left-[-16px]", isLow && "bg-red-50")}>
          <img
            src={lifeImgUrl}
            className={clsx("pointer-events-none block h-[24px] w-[24px] object-contain", isLow && "animate-pulse")}
            alt="HP"
          />
        </div>

        <div
          className={clsx(
            "absolute left-0 right-0 box-border flex flex-col justify-center rounded-[14px] border-[3px] border-solid overflow-hidden bg-[#e8f5e9] z-10 shadow-[0_4px_10px_rgba(0,0,0,0.08)] transition-all duration-150",
            borderColor,
            isMaxStars ? "h-[29px]" : "h-[52px]"
          )}
        >
          {!isMaxStars && (
            <div className={clsx("relative h-[23px] w-full bg-[#e2f1f8] border-b-[3px] border-solid overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] transition-all duration-150 shrink-0", borderColor)}>
              <div
                className="h-full bg-gradient-to-r from-[#29b6f6] to-[#0288d1] transition-all duration-150 shadow-[inset_0_-2px_3px_rgba(0,0,0,0.15)]"
                style={{ width: `${experience}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#1a3d1c] drop-shadow-[0_1.5px_0_rgba(255,255,255,1)] tracking-wider leading-none z-10 mt-[1px]">
                XP {experience}/100
              </span>
            </div>
          )}

          <div className="relative h-[23px] w-full overflow-hidden shrink-0">
            <div
              className={clsx(
                "h-full transition-all duration-150 shadow-[inset_0_-2px_3px_rgba(0,0,0,0.15)] bg-gradient-to-r",
                isLow ? "from-red-500 to-red-400" : "from-[#4caf50] to-[#81c784]"
              )}
              style={{ width: `${safeHp}%` }}
            />
          </div>
        </div>

        <div className={clsx(circleClass, "right-[-16px]")}>
          <span className="text-[24px] leading-none flex items-center justify-center h-full w-full">
            {currentEmoji}
          </span>
        </div>
      </div>

      <span className={clsx(
        "mt-2 text-center text-[26px] font-black drop-shadow-[0_2px_0_rgba(255,255,255,1)]",
        isLow ? "animate-bounce text-red-600" : "text-[#1a3d1c]"
      )}>
        {hp}%
      </span>
    </div>
  );
};
