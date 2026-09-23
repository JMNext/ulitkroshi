import { useApiStore } from "@/api/store/useApiStore";
import { EventBus } from "@/eventbus/EventBus";
import { StateCreator } from "zustand";
import { GameplayState, MainGameStateCombined } from "../useMainGameStore";

export const createGameplaySlice: StateCreator<MainGameStateCombined, [], [], GameplayState> = (set, get) => ({
  modal: null, alertText: null, isFoodOpen: false, isHelpShown: false, gameOverResult: null,

  startScanner: () => {
    set({ modal: null, isFoodOpen: false });
    EventBus.emit("main_scene_sleep"); EventBus.emit("scanner_scene_start");
    const game = typeof window !== "undefined" ? (window as any).phaserGame : null;
    if (game) {
      game.scene.sleep("MainScene");
      if (game.scene.getScene("ScannerScene")) {
        game.scene.isSleeping("ScannerScene") ? game.scene.wake("ScannerScene") : game.scene.start("ScannerScene");
      }
    }
  },

  setModal: (modal) => set({ modal }),
  setAlertText: (alertText) => set({ alertText }),
  setIsFoodOpen: (open) => set((s) => ({ isFoodOpen: typeof open === "function" ? open(s.isFoodOpen) : open })),
  setIsHelpShown: (isHelpShown) => set({ isHelpShown }),

  setGameOver: async (score, difficulty, initialIsWin) => {
    const numScore = score !== undefined ? Number(score) : 0;
    const diff = String(difficulty);
    let isWin = initialIsWin === true;
    let coins = 0;

    if (diff === "memory") coins = isWin ? (numScore === 8 ? 2 : 1) : 0;
    else if (diff.startsWith("memory_perfect_")) coins = isWin ? (diff === "memory_perfect_4" ? 5 : 100) : 0;
    else {
      isWin = difficulty ? initialIsWin : numScore >= 20 || numScore === 999;
      coins = isWin ? 5 : 2;
    }

    set({ gameOverResult: { isWin, rewardText: `+${coins}` } });
    if (coins <= 0) return;

    get().setUpdatingCoinsGlobal(true);
    const prev = get().coins;
    const next = prev + coins;
    set({ coins: next });

    try {
      const auth = useApiStore.getState();
      await auth.executeAction("mini_game_reward", coins, diff.startsWith("memory_perfect") ? "memory" : difficulty || isWin);
      set({ coins: next });
      if (auth.user) auth.coins = next;
    } catch {
      set({ coins: prev });
    } finally {
      setTimeout(() => get().setUpdatingCoinsGlobal(false), 150);
    }
  },
  clearGameOver: () => set({ gameOverResult: null })
});
