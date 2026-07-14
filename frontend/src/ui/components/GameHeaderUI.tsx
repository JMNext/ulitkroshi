import React, { useState, useEffect } from 'react';

interface GameHeaderUIProps {
  score: number;
  scoreLabel?: string;
  onBack: () => void;
}

export const GameHeaderUI = ({ score, scoreLabel, onBack }: GameHeaderUIProps) => {
  const [dims, setDims] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1024, h: typeof window !== 'undefined' ? window.innerHeight : 768 });

  useEffect(() => {
    const handleResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPort = dims.w < dims.h;
  const isLandscapeTablet = !isPort && (dims.w / dims.h) < 1.72; // Наш проверенный флаг для Nest Hub / Max
  const isUltraNarrow = isPort && (dims.w / dims.h) < 0.5;       // Наш проверенный флаг для Galaxy Fold

  // ИСПРАВЛЕНО: Заменили небезопасный document.getElementById на чистый и надежный поиск по URL/Сцене или пропсам
  // Если у вас мемори-игра, можно также передавать scoreLabel="ПАРА" напрямую при вызове компонента
  const isMemoryGame = typeof window !== 'undefined' && window.location.href.includes('memory');
  const finalLabel = scoreLabel || (isMemoryGame ? 'ПАРА' : 'СЧЕТ');

  // ИСПРАВЛЕНО: Динамический отступ сверху с учетом безопасной зоны челки/вырезов (env-safe)
  // На Nest Hub прижимаем выше (12px), на вытянутом Fold приподнимаем (24px)
  const paddingTopClass = isLandscapeTablet ? 'pt-3' : (isUltraNarrow ? 'pt-6' : 'pt-8 portrait:pt-5');

  // ИСПРАВЛЕНО: Резиновые боковые отступы, которые плавно сужаются на узких экранах
  const paddingXClass = isUltraNarrow ? 'px-3' : (isPort ? 'px-4' : (isLandscapeTablet ? 'px-6' : 'px-[4vw]'));

  // Адаптивные шрифты для ультра-узких экранов (чтобы кнопка и счет не врезались друг в друга)
  const btnTextClass = isUltraNarrow ? 'text-lg' : 'text-2xl portrait:text-lg md:portrait:text-xl';
  const scoreTextClass = isUltraNarrow ? 'text-base' : 'text-2xl portrait:text-lg md:portrait:text-xl';

  return (
    <div className={`absolute inset-x-0 top-0 flex justify-between items-center w-full pointer-events-none z-30 pb-4 box-border ${paddingXClass} ${paddingTopClass}`}>
      <button 
        onClick={onBack} 
        style={{ touchAction: 'manipulation' }}
        className={`pointer-events-auto font-black text-white hover:scale-105 active:scale-95 transition-transform drop-shadow-[0_3px_5px_rgba(0,0,0,0.6)] py-1.5 px-1 border-none bg-transparent cursor-pointer select-none leading-none ${btnTextClass}`}
      >
        ← НАЗАД
      </button>

      <div className={`bg-slate-900/80 backdrop-blur-md px-4 py-1.5 portrait:px-3 portrait:py-1 rounded-2xl border border-slate-700/50 text-white font-black drop-shadow-lg flex items-center gap-1.5 select-none pointer-events-auto box-border ${scoreTextClass}`}>
        <span className="tracking-wide">{finalLabel}:</span>
        <span className="text-amber-400 font-extrabold">{score}</span>
      </div>
    </div>
  );
};
