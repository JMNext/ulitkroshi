import { processGamePenalty } from "@/game/MiniGamesShared/storeUtils";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface CatchGameState {
  score: number; hp: number; isGameOver: boolean; isWin: boolean; petX: number;
  initGame: () => void; setPetX: (x: number) => void; resetStore: () => void;
  addScore: (cb: () => void) => void; applyBombPenalty: (cb: () => void) => void; applyMissPenalty: (cb: () => void) => void;
}

const initial = { score: 0, hp: 100, isGameOver: false, isWin: false, petX: 0 };

export const useCatchGameStore = create<CatchGameState>()(
  subscribeWithSelector((set, get) => ({
    ...initial,
    initGame: () => set(initial),
    setPetX: (x) => set({ petX: x }),
    resetStore: () => set(initial),

    addScore: (cb) => {
      const next = get().score + 1, win = next >= 20;
      if (win) useMainGameStore.getState().setGameOver(next, undefined, true);
      set({ score: next, isGameOver: win, isWin: win });
      cb();
    },

    applyBombPenalty: (cb) => {
      set(processGamePenalty(get().score, get().hp));
      cb();
    },
    applyMissPenalty: (cb) => {
      set(processGamePenalty(get().score, get().hp));
      cb();
    }
  }))
);
