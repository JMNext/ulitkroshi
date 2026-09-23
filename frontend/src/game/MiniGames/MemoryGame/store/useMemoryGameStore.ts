import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface MemoryGameState {
  score: number; isGameOver: boolean; isWash: boolean; deck: string[]; openedCards: number[]; matchedCards: string[]; canClick: boolean; isPreview: boolean; hasMisses: boolean;
  initGame: (pairsCount: number, availableCards: string[]) => void; setSwappedDeck: (newDeck: string[]) => void; setCanClickTrue: () => void; handleCardClick: (clickedIndex: number, totalPairs: number) => void; setWash: (wash: boolean) => void; resetStore: () => void;
}

const shuffle = <T>(arr: T[]): T[] => {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

const createDeck = (pairs: number, pool: string[]): string[] => {
  if (!pool?.length) return [];
  const sh = shuffle(pool); let sel: string[] = [];
  while (sel.length < pairs) sel = [...sel, ...sh.slice(0, pairs - sel.length)];
  return shuffle([...sel, ...sel]);
};

const initial = { score: 0, isGameOver: false, isWash: false, deck: [], openedCards: [], matchedCards: [], canClick: false, isPreview: true, hasMisses: false };

export const useMemoryGameStore = create<MemoryGameState>()(
  subscribeWithSelector((set, get) => ({
    ...initial,

    initGame: (pairs, pool) => set({ ...initial, deck: createDeck(pairs, pool), isPreview: true, canClick: false, hasMisses: false }),
    setSwappedDeck: (deck) => set({ deck }),
    setCanClickTrue: () => set({ canClick: true }),

    handleCardClick: (idx, pairs) => {
      const { canClick, openedCards: op, deck, matchedCards: match, score, hasMisses } = get();
      if (!canClick || op.includes(idx) || match.includes(deck[idx])) return;

      const nextOp = [...op, idx]; set({ openedCards: nextOp });
      if (nextOp.length !== 2) return;

      set({ canClick: false });
      const [first, second] = nextOp;
      const matchWin = deck[first] === deck[second];

      if (matchWin) {
        const nextScore = score + 1, win = nextScore === pairs;
        if (win) useMainGameStore.getState().setGameOver(nextScore, (!hasMisses ? `memory_perfect_${pairs}` : "memory") as any, true);
        setTimeout(() => set({ matchedCards: [...match, deck[first]], openedCards: [], score: nextScore, isWash: true, canClick: !win, isGameOver: win }), 300);
      } else {
        setTimeout(() => set({ openedCards: [], canClick: true, hasMisses: true }), 800);
      }
    },

    setWash: (isWash) => set({ isWash }),
    resetStore: () => set(initial)
  }))
);
