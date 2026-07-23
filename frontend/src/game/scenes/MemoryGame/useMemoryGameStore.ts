import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

const shuffle = <T>(arr: T[]): T[] => {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

const genDeck = (count: number, pool: string[]): string[] => {
  if (!pool?.length) return [];
  const sh = shuffle(pool); 
  let sel: string[] = [];
  while (sel.length < count) sel = [...sel, ...sh.slice(0, count - sel.length)];
  return [...sel, ...sel];
};

interface MemoryGameState {
  score: number; 
  isGameOver: boolean; 
  isWash: boolean; 
  deck: string[]; 
  openedCards: number[]; 
  matchedCards: string[]; 
  canClick: boolean;
  isPreview: boolean;
  initGame: (count: number, pool: string[]) => void;
  setSwappedDeck: (newDeck: string[]) => void;
  setCanClickTrue: () => void;
  handleCardClick: (idx: number, total: number) => void;
  setWash: (wash: boolean) => void;
  resetStore: () => void;
}

const initVals = { 
  score: 0, 
  isGameOver: false, 
  isWash: false, 
  deck: [], 
  openedCards: [], 
  matchedCards: [], 
  canClick: false,
  isPreview: true
};

export const useMemoryGameStore = create<MemoryGameState>()(
  subscribeWithSelector((set, get) => ({
    ...initVals,
    
    initGame: (count, pool) => {
      const initialDeck = genDeck(count, pool);
      set({ ...initVals, deck: initialDeck, isPreview: true, canClick: false });
    },
    
    setSwappedDeck: (newDeck) => {
      set({ deck: newDeck });
    },

    setCanClickTrue: () => {
      set({ canClick: true });
    },
    
    handleCardClick: (idx, total) => {
      const { canClick, openedCards, deck, matchedCards, score } = get();
      
      if (!canClick || openedCards.includes(idx) || matchedCards.includes(deck[idx])) return;
      
      const next = [...openedCards, idx]; 
      set({ openedCards: next });
      
      if (next.length !== 2) return;
      
      set({ canClick: false }); 
      const [f, s] = next;
      
      if (deck[f] === deck[s]) {
        const nextScore = score + 1;
        setTimeout(() => {
          set({ 
            matchedCards: [...matchedCards, deck[f]], 
            openedCards: [], 
            score: nextScore, 
            isWash: true, 
            canClick: nextScore < total, 
            isGameOver: nextScore === total 
          });
        }, 300);
      } else {
        setTimeout(() => {
          set({ 
            openedCards: [], 
            canClick: true 
          });
        }, 300);
      }
    },
    
    setWash: (isWash) => set({ isWash }),
    resetStore: () => set(initVals),
  }))
);
