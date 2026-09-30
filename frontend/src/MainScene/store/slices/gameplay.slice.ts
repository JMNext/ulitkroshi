import { gameApi } from "@/api/services/game.api";
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

    let coins = 0;
    let isWin = true;

    if (diff === "memory") {
      coins = numScore <= 4 ? 1 : 2;
    } else if (diff.startsWith("memory_perfect_")) {
      coins = diff === "memory_perfect_4" ? 5 : 100;
    } else {
      isWin = initialIsWin === true;
      coins = isWin ? 5 : 2;
    }

    if (usePetStore.getState().buffUntil > Date.now()) {
      coins += 1;
    }

    console.log(`[ФРОНТЕНД] Расчёт завершён. Очки: ${numScore}, Сложность: ${diff}, Награда: ${coins}`);

    set({ gameOverResult: { isWin, rewardText: "+" + coins } });
    if (coins <= 0) return;

    const prev = get().coins;
    const next = prev + coins;
    set({ coins: next });

    // Начисляем XP за мини-игру (серверная авторитетность)
    try {
      const activePetIndex = usePetStore.getState().activePetIndex || 0;
      const xpResult = await gameApi.gainXp("mini_game", activePetIndex, numScore);
      if (xpResult) {
        usePetStore.setState({
          experience: xpResult.newXp,
          level: xpResult.newLevel,
          stage: xpResult.newStage as any,
        });
        if (xpResult.stageTransition) {
          window.dispatchEvent(new CustomEvent("stage_transition", { detail: xpResult.stageTransition }));
        }
        const u = useApiStore.getState().user;
        if (u) {
          useApiStore.setState({
            user: {
              ...u,
              petExperiences: (u.petExperiences || []).map((v, i) => i === activePetIndex ? xpResult.newXp : v),
              petLevels: (u.petLevels || []).map((v, i) => i === activePetIndex ? xpResult.newLevel : v),
              petStages: (u.petStages || []).map((v, i) => i === activePetIndex ? xpResult.newStage : v),
            }
          });
        }
      }
    } catch (err: any) {
      console.error("[ФРОНТЕНД] Ошибка начисления XP за мини-игру:", err?.message || err);
    }

    try {
      const auth = useApiStore.getState();
      console.log(`[ФРОНТЕНД] Отправка в executeAction. Текущие монеты в useApiStore: ${auth.coins}`);

      await auth.executeAction("mini_game_reward", coins, diff.startsWith("memory_perfect") ? "memory" : difficulty || isWin);

      const currentUser = auth.user;
      if (currentUser) {
        useApiStore.setState({
          coins: next,
          user: { ...currentUser, coins: next }
        });
      }
    } catch (err: any) {
      console.error("[ФРОНТЕНД] Ошибка отправки награды в сеть:", err?.message || err);
      set({ coins: prev });
    }
  },
  clearGameOver: () => set({ gameOverResult: null })
});
