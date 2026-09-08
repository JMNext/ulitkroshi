import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { COIN_IMAGE_URL, GAMEOVER_TEXTS, CONFETTI_BASE_CONFIG, getGameOverModalScale } from './gameOverModal.constants';

interface GameOverModalUIProps {
  onRestart: () => void;
  onBack: () => void;
  isWin?: boolean;
  score?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const GameOverModalUI = ({ 
  onRestart, 
  onBack, 
  isWin: initialIsWin = false, 
  score,
  difficulty 
}: GameOverModalUIProps) => {
  const [scale, setScale] = useState(1);
  const { gameOverResult, setGameOver, clearGameOver } = useMainGameStore();

  useEffect(() => {
    setGameOver(score, difficulty, initialIsWin);
    return () => clearGameOver();
  }, [score, difficulty, initialIsWin, setGameOver, clearGameOver]);

  useEffect(() => {
    const handleResize = () => {
      setScale(getGameOverModalScale(window.innerWidth, window.innerHeight));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    cb();
  };

  if (!gameOverResult) return null;
  const { isWin, rewardText } = gameOverResult;

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 pointer-events-auto w-full h-full select-none"
      style={{ fontFamily: "'Arteks-Forced', sans-serif" }}
    >
      <article className="bg-white border-solid border-4 border-[#ff9800] text-center flex flex-col items-center justify-center w-[300px] p-6 pb-7 gap-4 rounded-[32px] origin-center shadow-lg" style={{ transform: `scale(${scale})` }}>
        <h1 className={`font-black tracking-wide leading-none text-[28px] m-0 ${isWin ? 'text-[#2e7d32]' : 'text-[#d32f2f]'}`}>
          {isWin ? GAMEOVER_TEXTS.winTitle : GAMEOVER_TEXTS.loseTitle}
        </h1>
        
        {score !== undefined && (
          <div className="flex flex-col gap-1 items-center justify-center">
            {!difficulty && score !== 999 && (
              <p className="font-extrabold text-slate-700 text-[20px] m-0 uppercase tracking-wide">
                {GAMEOVER_TEXTS.scoreLabel} <span className="text-[#1e1b4b] text-[24px] font-black">{score}</span>
              </p>
            )}
            <div className="flex items-center justify-center gap-0.5 mt-0.5 h-8">
              <span className="font-black text-slate-700 text-[18px] uppercase tracking-wide mr-1">
                {GAMEOVER_TEXTS.rewardLabel}
              </span>
              <span 
                className="font-black text-[26px] tracking-wide leading-none select-none text-[#ffb300]"
                style={{ WebkitTextStroke: '1px #ffffff', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))' }}
              >
                {rewardText}
              </span>
              <img 
                src={COIN_IMAGE_URL} 
                className="w-7 h-7 object-contain block select-none pointer-events-none" 
                alt="" 
              />
            </div>
          </div>
        )}

        <nav className="flex flex-col w-full gap-2.5 mt-1">
          <button type="button" onClick={() => clickAction(onRestart)} className="w-full flex items-center justify-center font-black text-white text-[16px] h-11 rounded-[16px] border-none uppercase tracking-wide bg-[#ff9800] cursor-pointer">
            {GAMEOVER_TEXTS.restartBtn}
          </button>
          <button type="button" onClick={() => clickAction(onBack)} className="w-full flex items-center justify-center font-black text-[#1e1b4b] text-[16px] h-11 rounded-[16px] border-none uppercase tracking-wide bg-[#81c714] cursor-pointer">
            {GAMEOVER_TEXTS.exitBtn}
          </button>
        </nav>
      </article>
    </div>
  );
};
