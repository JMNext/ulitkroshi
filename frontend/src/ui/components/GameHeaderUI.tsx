import React from 'react';

interface GameHeaderUIProps {
  score: number;
  scoreLabel?: string;
  onBack: () => void;
}

export const GameHeaderUI = ({ score, scoreLabel, onBack }: GameHeaderUIProps) => {
  const isMemoryGame = typeof document !== 'undefined' && !!document.getElementById('memory-ui-overlay');
  const finalLabel = scoreLabel || (isMemoryGame ? 'ПАРА' : 'СЧЕТ');

  return (
    <div className="absolute inset-x-0 top-0 flex justify-between items-center w-full p-6 pl-[65px] pr-[65px] portrait:pl-4 portrait:pr-4 pt-10 portrait:pt-6 pointer-events-none z-30 env-safe-top">
      <button 
        onClick={onBack} 
        className="pointer-events-auto font-black text-white text-3xl portrait:text-xl md:portrait:text-2xl hover:scale-105 active:scale-95 transition-transform drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] py-2 px-1 select-none"
      >
        ← НАЗАД
      </button>

      <div className="bg-slate-900/80 backdrop-blur-md px-6 py-2 portrait:px-4 portrait:py-1.5 rounded-2xl border border-slate-700/50 text-white font-black text-2xl portrait:text-lg md:portrait:text-xl drop-shadow-lg flex items-center gap-2 select-none pointer-events-auto">
        <span>{finalLabel}:</span>
        <span className="text-amber-400 font-extrabold">{score}</span>
      </div>
    </div>
  );
};
