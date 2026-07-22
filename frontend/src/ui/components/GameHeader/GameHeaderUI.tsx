import { MouseEvent } from 'react';
import React from 'react';
import lifeIcon from '../../../assets/interface-icons/life.svg';

interface GameHeaderUIProps {
  score: number;
  scoreLabel?: string;
  onBack: () => void;
  hp?: number;
}

export const GameHeaderUI = ({ score, scoreLabel, onBack, hp }: GameHeaderUIProps) => {
  const finalLabel = scoreLabel || 'СЧЕТ';
  
  const hasLives = typeof hp === 'number';
  const livesCount = hasLives ? Math.ceil(hp / 25) : 0;
  const dummyLives = Array.from({ length: 4 });

  const handleBackClick = () => {
    onBack();
  };

  return (
    <header className="absolute left-0 right-0 flex justify-between items-start box-border pointer-events-none z-30 border-none m-0 bg-transparent top-8 px-8 md:px-16">
      <div className="flex flex-col items-start gap-3">
        <button
          type="button"
          onClick={handleBackClick}
          className="pointer-events-auto font-black text-white transition-transform drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] py-1.5 px-2 cursor-pointer leading-none border-none bg-transparent outline-none m-0 scale-100 text-[24px] hover:scale-105 active:scale-95"
        >
          <span className="block">← НАЗАД</span>
        </button>

        {hasLives && (
          <div className="flex items-center gap-1.5 px-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {dummyLives.map((_, idx) => (
              <img
                key={`life-${idx}`}
                src={lifeIcon}
                className={`w-7 h-7 object-contain transition-all duration-300 ${
                  idx < livesCount ? 'opacity-100 scale-100' : 'opacity-20 scale-75 grayscale'
                }`}
                alt="life"
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md border border-solid border-slate-700/50 text-white font-black drop-shadow-lg flex items-center box-border m-0 rounded-2xl p-3 px-5 gap-2">
        <p className="tracking-wide block m-0 p-0 border-none bg-transparent leading-none text-[20px]">{finalLabel}:</p>
        <p className="text-amber-400 font-extrabold block m-0 p-0 border-none bg-transparent leading-none text-[20px]">{score}</p>
      </div>
    </header>
  );
};
