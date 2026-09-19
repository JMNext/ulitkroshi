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
  initGame: () => void;
  addScore: (renderCallback: () => void) => void;
  addBotScore: (botId: 1 | 2, renderCallback: () => void) => void;
  applyPenalty: (renderCallback: () => void, forceGameOver?: boolean) => void;
  resetStore: () => void;
}

const initialValues = { score: 0, bot1Score: 0, bot2Score: 0, hp: 100, isGameOver: false, isWin: false, isCrashed: false };
let crashTimeoutId: ReturnType<typeof setTimeout> | null = null;

export const useRacingGameStore = create<RacingGameState>()(
  subscribeWithSelector((set, get) => ({
    ...initialValues,

    initGame: () => {
      if (crashTimeoutId) clearTimeout(crashTimeoutId);
      set(initialValues);
    },

    addScore: (renderCallback) => {
      if (get().isGameOver) return;
      const nextScore = get().score + 1;
      const isWin = nextScore >= 20;

      if (isWin) {
        useMainGameStore.getState().setGameOver(nextScore, undefined, true);
        set({ score: nextScore, isGameOver: true, isWin: true });
      } else {
        set({ score: nextScore });
      }
      renderCallback();
    },

    addBotScore: (botId, renderCallback) => {
      if (get().isGameOver) return;

      const b1 = botId === 1 ? get().bot1Score + 1 : get().bot1Score;
      const b2 = botId === 2 ? get().bot2Score + 1 : get().bot2Score;
      const botWon = b1 >= 20 || b2 >= 20;

      if (botWon) {
        useMainGameStore.getState().setGameOver(get().score, undefined, false);
        if (!get().isWin) usePetStore.getState().handleGameLoss();
        set({ bot1Score: b1, bot2Score: b2, isGameOver: true, isWin: false });
      } else {
        set({ bot1Score: b1, bot2Score: b2 });
      }
      renderCallback();
    },

    applyPenalty: (renderCallback, forceGameOver = false) => {
      if (get().isCrashed && !forceGameOver) {
        renderCallback();
        return;
      }
      if (crashTimeoutId) clearTimeout(crashTimeoutId);

      const currentScore = get().score;
      const nextScore = currentScore > 0 ? currentScore - 1 : 0;
      const nextHp = forceGameOver ? 0 : get().hp - 25;
      const isOver = nextHp <= 0 || forceGameOver;

      if (isOver) {
        useMainGameStore.getState().setGameOver(nextScore, undefined, false);
        if (!get().isWin) usePetStore.getState().handleGameLoss();
        set({ hp: 0, score: nextScore, isGameOver: true, isWin: false });
      } else {
        set({ hp: nextHp, score: nextScore, isCrashed: true });
      }

      renderCallback();

      if (!isOver) {
        crashTimeoutId = setTimeout(() => set({ isCrashed: false }), 300);
      }
    },

    resetStore: () => {
      if (crashTimeoutId) clearTimeout(crashTimeoutId);
      set(initialValues);
    }
  }))
);
