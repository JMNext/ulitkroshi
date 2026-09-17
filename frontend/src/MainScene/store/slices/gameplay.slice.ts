import { StateCreator } from "zustand";
import { MainGameStateCombined, GameplayState, CustomWindow } from "../useMainGameStore";
import { useApiStore } from "@/api/store/useApiStore";
import { EventBus } from "@/eventbus/EventBus";

export const createGameplaySlice: StateCreator<MainGameStateCombined, [], [], GameplayState> = (set, get) => ({
  modal: "help",
  alertText: null,
  isFoodOpen: false,
  width: 1920,
  height: 1080,
  isVert: false,
  isPortrait: false,
  scale: 1,
  finalScale: 1,
  s: 1,
  styles: null,
  gameOverResult: null,

  startScanner: () => {
    set({ modal: null, isFoodOpen: false });
    EventBus.emit("main_scene_sleep");
    EventBus.emit("scanner_scene_start");
    if (typeof window !== "undefined") {
      const customWindow = window as unknown as CustomWindow;
      const game = customWindow.phaserGame;
      if (game) {
        game.scene.sleep("MainScene");
        const scanner = game.scene.getScene("ScannerScene");
        if (scanner) {
          if (game.scene.isSleeping("ScannerScene")) game.scene.wake("ScannerScene");
          else if (!game.scene.isActive("ScannerScene")) game.scene.start("ScannerScene");
        }
      }
    }
  },

  setModal: (modal) => set({ modal }),
  setAlertText: (alertText) => set({ alertText }),
  setIsFoodOpen: (open) => set((s) => ({ isFoodOpen: typeof open === "function" ? open(s.isFoodOpen) : open })),

  setLayoutData: (data) =>
    set({
      scale: data.scale, finalScale: data.finalScale, s: data.s, width: data.width, height: data.height, isVert: data.height > data.width, isPortrait: data.height > data.width,
      styles: { header: { ...data.styles.header }, sideLeft: { ...data.styles.sideLeft }, sideRight: { ...data.styles.sideRight }, food: { ...data.styles.food }, bottom: { ...data.styles.bottom }, pet: { ...data.styles.pet } }
    }),

  setGameOver: async (score, difficulty, initialIsWin) => {
    const numericScore = score !== undefined ? Number(score) : 0;
    let isWin = initialIsWin === true;
    let finalRewardCoins = 0;
    const diffStr = String(difficulty);

    if (diffStr === "memory") {
      finalRewardCoins = isWin ? (numericScore === 8 || score === 8 ? 2 : 1) : 0;
    } else if (diffStr.startsWith("memory_perfect_")) {
      if (isWin) {
        finalRewardCoins = diffStr === "memory_perfect_4" ? 5 : 100;
      }
    } else {
      isWin = difficulty ? initialIsWin : (numericScore >= 20 || numericScore === 999);
      finalRewardCoins = isWin ? 5 : 2;
    }

    const rewardText = `+${finalRewardCoins}`;
    set({ gameOverResult: { isWin, rewardText } });

    if (finalRewardCoins > 0) {
      get().setUpdatingCoinsGlobal(true);
      const currentCoins = get().coins;
      const exactNextCoins = currentCoins + finalRewardCoins;
      set({ coins: exactNextCoins });

      try {
        const auth = useApiStore.getState();
        const serverDiff = diffStr.startsWith("memory_perfect") ? "memory" : (difficulty || isWin);

        await auth.executeAction("mini_game_reward", finalRewardCoins, serverDiff);

        set({ coins: exactNextCoins });
        if (auth.user) {
          auth.coins = exactNextCoins;
        }
      } catch {
        set({ coins: currentCoins });
      } finally {
        setTimeout(() => {
          get().setUpdatingCoinsGlobal(false);
        }, 150);
      }
    }
  },

  clearGameOver: () => set({ gameOverResult: null })
});
