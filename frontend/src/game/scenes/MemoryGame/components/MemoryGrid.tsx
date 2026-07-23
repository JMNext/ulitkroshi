import { useEffect, useState, useRef } from 'react';
import { useMemoryGameStore } from '../useMemoryGameStore';
import cardShirtSvg from '/src/assets/buttom_menu-icons/sleep.svg';

const fruitsGlob = import.meta.glob('/src/assets/fruits/fruits_*.png', { eager: true, query: '?url' }) as Record<string, { default: string }>;

export const MemoryGrid = ({ 
  difficulty, 
  totalPairs, 
  metrics, 
  onReady 
}: { 
  difficulty: string; 
  totalPairs: number; 
  metrics: any; 
  onReady: () => void; 
  scene: any; 
}) => {
  const { deck, openedCards, matchedCards, isPreview, setSwappedDeck, setCanClickTrue, handleCardClick } = useMemoryGameStore();
  const [{ isPort, scale }, setGeo] = useState({ isPort: false, scale: 1 });
  
  const [activeSwap, setActiveSwap] = useState<{ i1: number; i2: number } | null>(null);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const deckRef = useRef<string[]>([]);
  const cachedPositions = useRef<{ left: number; top: number }[]>([]);

  useEffect(() => {
    deckRef.current = deck;
  }, [deck]);

  useEffect(() => {
    const el = document.getElementById('game-container');
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      const port = h > w;
      const s = port ? (w * 0.96) / 340 : (w < 1000 ? Math.min(w - 340, h - 180, 520) / 400 : Math.min(w / 1920, h / 1080, 0.75));
      setGeo({ isPort: port, scale: s });
    });
    obs.observe(el); onReady(); return () => obs.disconnect();
  }, [onReady]);

  useEffect(() => {
    if (deck.length === 0) return;

    const previewTimeout = setTimeout(() => {
      useMemoryGameStore.setState({ isPreview: false });

      setTimeout(() => {
        cachedPositions.current = cardRefs.current.map(el => {
          if (!el) return { left: 0, top: 0 };
          const rect = el.getBoundingClientRect();
          return { left: rect.left, top: rect.top };
        });

        let currentDeck = [...deckRef.current];
        const totalSwaps = 5; 
        let swapCount = 0;

        const runVisualSwap = () => {
          if (swapCount >= totalSwaps) {
            setActiveSwap(null);
            setCanClickTrue();
            return;
          }

          const idx1 = Math.floor(Math.random() * currentDeck.length);
          let idx2 = Math.floor(Math.random() * currentDeck.length);
          while (idx1 === idx2) {
            idx2 = Math.floor(Math.random() * currentDeck.length);
          }

          setActiveSwap({ i1: idx1, i2: idx2 });

          setTimeout(() => {
            const temp = currentDeck[idx1];
            currentDeck[idx1] = currentDeck[idx2];
            currentDeck[idx2] = temp;
            
            setSwappedDeck([...currentDeck]);
            setActiveSwap(null);
            swapCount++;

            setTimeout(runVisualSwap, 80);
          }, 350); 
        };

        runVisualSwap();
      }, 400);
    }, 2200);

    return () => clearTimeout(previewTimeout);
  }, [deck.length]);

  const isEasy = difficulty === 'easy', useFlex = isPort && isEasy;
  const maxW = isPort ? (isEasy ? 'max-w-[340px]' : 'max-w-[440px]') : (window.innerWidth < 1000 ? 'max-w-[560px]' : 'max-w-[750px]');
  const boxStyles = "w-full h-full rounded-[20px] bg-white border-[4px] border-solid border-[#61aa05] flex items-center justify-center p-3 box-border shadow-lg";

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none z-40">
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center', width: '100%' }} className="pointer-events-auto flex justify-center items-center px-4">
        <div className={`${maxW} w-full p-2 box-border bg-transparent border-none gap-3 justify-center items-center ${useFlex ? 'flex flex-wrap' : 'grid grid-cols-4'}`}>
          {deck.map((id, i) => {
            const isMatched = matchedCards.includes(id);
            const open = isPreview || openedCards.includes(i) || isMatched;

            let transformStyle = 'translate(0px, 0px)';
            let zIdx = 1;

            if (activeSwap) {
              const { i1, i2 } = activeSwap;
              if (i === i1 || i === i2) {
                const targetIdx = i === i1 ? i2 : i1;
                const p1 = cachedPositions.current[i];
                const p2 = cachedPositions.current[targetIdx];

                if (p1 && p2 && (p1.left !== 0 || p1.top !== 0)) {
                  const dx = (p2.left - p1.left) / scale;
                  const dy = (p2.top - p1.top) / scale;
                  const arcOffset = i === i1 ? -25 : 25;
                  transformStyle = `translate(${dx}px, ${dy + arcOffset}px)`;
                  zIdx = 50;
                }
              }
            }

            const cardMovementStyle = {
              transform: transformStyle,
              zIndex: zIdx,
              transition: activeSwap ? 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)' : 'transform 0s, opacity 0.4s ease, scale 0.4s ease'
            };

            return (
              <div 
                key={i}
                ref={(el) => { if (el) cardRefs.current[i] = el; }}
                onClick={() => handleCardClick(i, totalPairs)} 
                style={cardMovementStyle}
                className={`aspect-square relative cursor-pointer select-none touch-none [perspective:1000px] ${useFlex ? 'w-[calc(33.333%-12px)]' : 'w-full'} ${isMatched ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}`}
              >
                <div className={`w-full h-full duration-300 [transform-style:preserve-3d] relative transition-transform ${open ? '[transform:rotateY(180deg)]' : ''}`}>
                  <div className={`${boxStyles} absolute inset-0 [backface-visibility:hidden]`}>
                    <img src={cardShirtSvg} className="w-[85%] h-[85%] object-contain select-none pointer-events-none" alt="shirt" />
                  </div>
                  <div className={`${boxStyles} absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]`}>
                    {open && <img src={fruitsGlob[`/src/assets/fruits/fruits_${id}.png`]?.default || ''} className="w-[88%] h-[88%] object-contain select-none pointer-events-none" alt="fruit" />}
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
