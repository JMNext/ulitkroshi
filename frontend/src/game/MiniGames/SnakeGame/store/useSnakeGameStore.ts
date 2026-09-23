import { processGamePenalty } from "@/game/MiniGamesShared/storeUtils";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface SnakeGameState {
  score: number;
  hp: number;
  isGameOver: boolean;
  isWin: boolean;
  isWash: boolean;
  isCrashed: boolean;
  initGame: () => void;
  resetStore: () => void;
  addScore: (cb: () => void) => void;
  applyPenalty: (cb: () => void, force?: boolean) => void;
}

const initial = { score: 0, hp: 100, isGameOver: false, isWin: false, isWash: false, isCrashed: false };
let crashId: any = null;

export const useSnakeGameStore = create<SnakeGameState>()(
  subscribeWithSelector((set, get) => ({
    ...initial,
    initGame: () => {
      if (crashId) clearTimeout(crashId);
      set(initial);
    },

    addScore: (cb) => {
      const next = get().score + 1, win = next >= 20;
      if (win) useMainGameStore.getState().setGameOver(next, undefined, true);
      set({ score: next, isGameOver: win, isWin: win });
      cb();
    },

    applyPenalty: (cb, force = false) => {
      if (crashId) clearTimeout(crashId);
      const nextState = processGamePenalty(get().score, get().hp, force);
      set(nextState);
      cb();

      if (!nextState.isGameOver) crashId = setTimeout(() => set({ isCrashed: false }), 800);
    },

    resetStore: () => {
      if (crashId) clearTimeout(crashId);
      set(initial);
    }
  }))
);
