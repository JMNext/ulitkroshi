import { processGamePenalty } from "@/game/MiniGamesShared/storeUtils";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface RacingGameState {
  score: number;
  bot1Score: number;
  bot2Score: number;
  hp: number;
  isGameOver: boolean;
  isWin: boolean;
  isCrashed: boolean;
  isFinishing: boolean;
  initGame: () => void;
  resetStore: () => void;
  addScore: (cb: () => void) => void;
  addBotScore: (id: 1 | 2, cb: () => void) => void;
  applyPenalty: (cb: () => void, force?: boolean) => void;
}

const initial = { score: 0, bot1Score: 0, bot2Score: 0, hp: 100, isGameOver: false, isWin: false, isCrashed: false, isFinishing: false };
let crashId: any = null;

export const useRacingGameStore = create<RacingGameState>()(
  subscribeWithSelector((set, get) => ({
    ...initial,
    initGame: () => {
      if (crashId) clearTimeout(crashId);
      set(initial);
    },

    addScore: (cb) => {
      if (get().isGameOver || get().isFinishing) return;
      const next = get().score + 1;
      set(next >= 20 ? { score: next, isFinishing: true } : { score: next });
      cb();
    },

    addBotScore: (id, cb) => {
      if (get().isGameOver || get().isFinishing) return;
      const b1 = id === 1 ? get().bot1Score + 1 : get().bot1Score,
        b2 = id === 2 ? get().bot2Score + 1 : get().bot2Score;

      if (b1 >= 20 || b2 >= 20) {
        useMainGameStore.getState().setGameOver(get().score, undefined, false);
        if (!get().isWin) usePetStore.getState().handleGameLoss();
        set({ bot1Score: b1, bot2Score: b2, isGameOver: true, isWin: false });
      } else set({ bot1Score: b1, bot2Score: b2 });
      cb();
    },

    applyPenalty: (cb, force = false) => {
      if (get().isCrashed && !force) return cb();
      if (crashId) clearTimeout(crashId);

      const nextState = processGamePenalty(get().score, get().hp, force);

      if (nextState.isGameOver) {
        set({ hp: 0, score: nextState.score, isGameOver: true, isWin: false, isFinishing: false });
      } else {
        set({ hp: nextState.hp, score: nextState.score, isCrashed: true });
      }

      cb();
      if (!nextState.isGameOver) crashId = setTimeout(() => set({ isCrashed: false }), 300);
    },

    resetStore: () => {
      if (crashId) clearTimeout(crashId);
      set(initial);
    }
  }))
);
