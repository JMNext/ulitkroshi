import { useApiStore } from "@/api/store/useApiStore";
import { EventBus } from "@/eventbus/EventBus";
import { StateCreator } from "zustand";
import { GameplayState, MainGameStateCombined } from "../useMainGameStore";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

interface SnailPhaserGameWindow {
  phaserGame?: {
    scene: {
      sleep: (key: string) => void;
      wake: (key: string) => void;
      start: (key: string) => void;
      getScene: (key: string) => unknown;
      isSleeping: (key: string) => boolean;
    };
  };
}

export const createGameplaySlice: StateCreator<MainGameStateCombined, [], [], GameplayState> = (set, get) => ({
  modal: null, alertText: null, isFoodOpen: false, isHelpShown: false, gameOverResult: null,

  startScanner: () => {
    set({ modal: null, isFoodOpen: false });
    EventBus.emit("main_scene_sleep"); EventBus.emit("scanner_scene_start");

    if (typeof window !== "undefined") {
      const gw = window as unknown as SnailPhaserGameWindow;
      if (gw.phaserGame) {
        gw.phaserGame.scene.sleep("MainScene");
        if (gw.phaserGame.scene.getScene("ScannerScene")) {
          if (gw.phaserGame.scene.isSleeping("ScannerScene")) {
            gw.phaserGame.scene.wake("ScannerScene");
          } else {
            gw.phaserGame.scene.start("ScannerScene");
          }
        }
      }
    }
  },

  setModal: (modal) => set({ modal }),
  setAlertText: (alertText) => set({ alertText }),
  setIsFoodOpen: (open) => set((s) => ({ isFoodOpen: typeof open === "function" ? open(s.isFoodOpen) : open })),
  setIsHelpShown: (isHelpShown) => set({ isHelpShown }),

  setGameOver: async (score, difficulty, initialIsWin) => {
    const numScore = score !== undefined ? Number(score) : 0;
    const diff = String(difficulty || "");

    // ПРЯМОЙ И СТАБИЛЬНЫЙ РАСЧЕТ МОНЕТ БЕЗ СБОЕВ ТИПОВ ДАННЫХ ДЛЯ ИГРЫ ПАМЯТЬ:
    let coins = 0;
    let isWin = true;

    if (diff === "memory") {
      // Исходное начисление: 1 монета за легкий (меньше 6 пар), 2 монеты за средний и тяжелый
      coins = numScore <= 4 ? 1 : 2;
    } else if (diff.startsWith("memory_perfect_")) {
      coins = diff === "memory_perfect_4" ? 5 : 100;
    } else {
      isWin = initialIsWin === true;
      coins = isWin ? 5 : 2;
    }

    // Если у персонажа активен бафф, гарантированно накидываем сверху +1 монету
    if (usePetStore.getState().buffUntil > Date.now()) {
      coins += 1;
    }

    set({ gameOverResult: { isWin, rewardText: "+" + coins } });
    if (coins <= 0) return;

    get().setUpdatingCoinsGlobal(true);
    const prev = get().coins;
    const next = prev + coins;
    set({ coins: next });

    try {
      const auth = useApiStore.getState();
      // Вызываем исправленный GET-метод экшена, передавая финальное число монет напрямую
      await auth.executeAction("mini_game_reward", coins, diff.startsWith("memory_perfect") ? "memory" : difficulty || isWin);

      const currentUser = auth.user;
      if (currentUser) {
        useApiStore.setState({
          coins: next,
          user: { ...currentUser, coins: next }
        });
      }
    } catch {
      set({ coins: prev });
    } finally {
      setTimeout(() => get().setUpdatingCoinsGlobal(false), 150);
    }
  },
  clearGameOver: () => set({ gameOverResult: null })
});
