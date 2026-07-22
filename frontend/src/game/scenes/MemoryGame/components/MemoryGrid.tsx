import React, { useEffect, useState } from 'react';
import { useMemoryGameStore } from '../useMemoryGameStore';
import cardShirtSvg from '/src/assets/buttom_menu-icons/sleep.svg';

const fruitsGlob = import.meta.glob('/src/assets/fruits/fruits_*.png', { eager: true, query: '?url' }) as Record<string, { default: string }>;

export const MemoryGrid = ({ difficulty, totalPairs, onReady }: { difficulty: string; totalPairs: number; onReady: () => void; scene: any }) => {
  const { deck, openedCards, matchedCards, canClick, handleCardClick } = useMemoryGameStore();
  const [isPortrait, setIsPortrait] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = document.getElementById('game-container');
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      const port = h > w;
      setIsPortrait(port);

      if (port) {
        // ИСПРАВЛЕНО: Увеличили базовый масштаб карточек в портрете за счет деления на 340 (было 440)
        setScale((w * 0.96) / 340);
      } else {
        const isMob = w < 1000;
        const gridW = Math.min(w - 340, h - 180, 520);
        setScale(isMob ? gridW / 400 : Math.min(w / 1920, h / 1080, 0.75));
      }
    });

    observer.observe(container);
    onReady();
    return () => observer.disconnect();
  }, [onReady]);

  // ИСПРАВЛЕНО: Для легкого уровня (8 карт) в портрете сужаем ширину до 340px, чтобы Flexbox переносил карты строго по 3 в ряд (3 + 3 + 2)
  const isEasy = difficulty === 'easy';
  const maxW = isPortrait 
    ? (isEasy ? 'max-w-[340px]' : 'max-w-[440px]') 
    : (window.innerWidth < 1000 ? 'max-w-[560px]' : 'max-w-[750px]');

  // ИСПРАВЛЕНО: Для легкого уровня на мобилках используем гибкий flex с центрированием вместо жесткой сетки grid-cols-4
  const containerClass = (isPortrait && isEasy)
    ? `flex flex-wrap justify-center gap-3 w-full p-2 box-border bg-transparent border-none ${maxW}`
    : `grid grid-cols-4 gap-4 w-full justify-center items-center p-2 box-border bg-transparent border-none ${maxW}`;

  // Вычисляем ширину одной карточки для Flex-режима (примерно 30% от ширины контейнера, чтобы влезало ровно 3 штуки в ряд)
  const cardItemClass = (isPortrait && isEasy)
    ? 'w-[calc(33.333%-12px)] aspect-square relative cursor-pointer select-none touch-none [perspective:1000px]'
    : 'w-full aspect-square relative cursor-pointer select-none touch-none [perspective:1000px]';

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-40">
      <div 
        style={{ transform: `scale(${scale})`, transformOrigin: 'center center', width: '100%' }} 
        className="pointer-events-auto flex justify-center items-center px-4"
      >
        <div className={containerClass}>
          {deck.map((id, idx) => {
            const isOpened = openedCards.includes(idx) || matchedCards.includes(id) || !canClick;
            const url = fruitsGlob[`/src/assets/fruits/fruits_${id}.png`]?.default || '';

            return (
              <div key={idx} onClick={() => handleCardClick(idx, totalPairs)} className={cardItemClass}>
                <div className={`w-full h-full duration-300 [transform-style:preserve-3d] relative transition-transform ${isOpened ? '[transform:rotateY(180deg)]' : ''}`}>
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[20px] bg-white border-[4px] border-solid border-[#61aa05] flex items-center justify-center p-3 box-border shadow-lg">
                    <img src={cardShirtSvg} className="w-[85%] h-[85%] object-contain select-none pointer-events-none" alt="shirt" />
                  </div>
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[20px] bg-white border-[4px] border-solid border-[#61aa05] flex items-center justify-center p-3 box-border shadow-lg">
                    {isOpened && <img src={url} className="w-[88%] h-[88%] object-contain select-none pointer-events-none" alt="fruit" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
