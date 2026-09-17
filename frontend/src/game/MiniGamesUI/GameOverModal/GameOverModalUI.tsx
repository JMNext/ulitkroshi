import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import confetti from "canvas-confetti";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { COIN_IMAGE_URL, CONFETTI_BASE_CONFIG, GAMEOVER_TEXTS, getGameOverModalScale } from "./constants/gameOverModal.constants";

interface GameOverModalUIProps {
  onRestart: () => void;
  onBack: () => void;
  isWin?: boolean;
  score?: number;
  difficulty?: "easy" | "medium" | "hard" | "memory";
}

export const GameOverModalUI = ({ onRestart, onBack, score, difficulty }: GameOverModalUIProps) => {
  const [scale, setScale] = useState(1);
  const { gameOverResult } = useMainGameStore();

  const finalScore = score !== undefined ? Number(score) : 0;
  const isMemory = difficulty === "memory";

  useEffect(() => {
    const handleResize = () => {
      setScale(getGameOverModalScale(window.innerWidth, window.innerHeight));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!gameOverResult?.isWin) return;
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      confetti({ ...CONFETTI_BASE_CONFIG, angle: 60, origin: { x: 0, y: 0.85 } });
      confetti({ ...CONFETTI_BASE_CONFIG, angle: 120, origin: { x: 1, y: 0.85 } });
    }, 120);

    return () => clearInterval(interval);
  }, [gameOverResult]);

  const clickAction = (cb: () => void) => {
    (document.activeElement as HTMLElement)?.blur?.();
    cb();
  };

  if (!gameOverResult) return null;
  const { isWin: resultIsWin, rewardText } = gameOverResult;

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-50 flex h-full w-full items-center justify-center bg-black/60 select-none"
      style={{ fontFamily: "'Arteks-Forced', sans-serif" }}
    >
      <article
        className="flex w-[300px] origin-center flex-col items-center justify-center gap-4 rounded-[32px] border-4 border-solid border-[#ff9800] bg-white p-6 pb-7 text-center shadow-lg"
        style={{ transform: `scale(${scale})` }}
      >
        <h1 className={clsx("m-0 text-[28px] leading-none font-black tracking-wide", resultIsWin ? "text-[#2e7d32]" : "text-[#d32f2f]")}>
          {resultIsWin ? GAMEOVER_TEXTS.winTitle : GAMEOVER_TEXTS.loseTitle}
        </h1>

        <div className="flex flex-col items-center justify-center gap-1">
          {!isMemory && finalScore !== 999 && (
            <p className="m-0 text-[20px] font-extrabold tracking-wide text-slate-700 uppercase">
              {GAMEOVER_TEXTS.scoreLabel} <span className="text-[24px] font-black text-[#1e1b4b]">{finalScore}</span>
            </p>
          )}
          <div className="mt-0.5 flex h-8 items-center justify-center gap-0.5">
            <span className="mr-1 text-[18px] font-black tracking-wide text-slate-700 uppercase">{GAMEOVER_TEXTS.rewardLabel}</span>
            <span
              className="text-[26px] leading-none font-black tracking-wide text-[#ffb300] select-none"
              style={{ WebkitTextStroke: "1px #ffffff", filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.15))" }}
            >
              {rewardText}
            </span>
            <img src={COIN_IMAGE_URL} className="pointer-events-none block h-7 w-7 object-contain select-none" alt="" />
          </div>
        </div>

        <nav className="mt-1 flex w-full flex-col gap-2.5">
          <button
            type="button"
            onClick={() => clickAction(onRestart)}
            className="flex h-11 w-full cursor-pointer items-center justify-center rounded-[16px] border-none bg-[#ff9800] text-[16px] font-black tracking-wide text-white uppercase"
          >
            {GAMEOVER_TEXTS.restartBtn}
          </button>
          <button
            type="button"
            onClick={() => clickAction(onBack)}
            className="flex h-11 w-full cursor-pointer items-center justify-center rounded-[16px] border-none bg-[#81c714] text-[16px] font-black tracking-wide text-[#1e1b4b] uppercase"
          >
            {GAMEOVER_TEXTS.exitBtn}
          </button>
        </nav>
      </article>
    </div>
  );
};
