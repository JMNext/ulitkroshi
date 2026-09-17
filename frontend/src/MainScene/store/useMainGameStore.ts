import { AvatarId } from "@/MainScene/components/Avatars/Avatars";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { api } from "@/api/api";
import { useApiStore } from "@/api/store/useApiStore";
import { create } from "zustand";

export interface MainGameStyles {
  header: React.CSSProperties; sideLeft: React.CSSProperties; sideRight: React.CSSProperties; food: React.CSSProperties; bottom: React.CSSProperties; pet: React.CSSProperties;
}

interface MainGameState {
  coins: number; username: string; avatarId: AvatarId; modal: string | null; alertText: string | null; isFoodOpen: boolean;
  width: number; height: number; isVert: boolean; isPortrait: boolean; scale: number; finalScale: number; s: number; styles: MainGameStyles | null;
  gameOverResult: { isWin: boolean; rewardText: string } | null;
  userId: number | null;
  addTestCoins: () => Promise<void>;
  buyFruit: (slotId: string, fruitId: number, qty: number, cost: number) => Promise<boolean>;
  setUsername: (name: string) => Promise<void>;
  setAvatarId: (id: AvatarId) => void;
  addPetByCode: (code: string) => boolean;
  resetStore: () => Promise<void>;
  setModal: (modal: string | null) => void;
  setAlertText: (text: string | null) => void;
  setIsFoodOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setLayoutData: (data: { scale: number; finalScale: number; s: number; width: number; height: number; styles: MainGameStyles }) => void;
  setGameOver: (score: number | undefined, difficulty: "easy" | "medium" | "hard" | "memory" | undefined, initialIsWin: boolean) => Promise<void>;
  clearGameOver: () => void;
}

const getInitialUsername = (): string => {
  if (typeof window !== "undefined") {
    const localName = localStorage.getItem("local_saved_username");
    if (localName && localName.trim()) return localName.trim();
  }
  return useApiStore.getState().user?.name || "Игрок";
};

export const useMainGameStore = create<MainGameState>((set, get) => ({
  username: getInitialUsername(),
  coins: useApiStore.getState().coins || 0,
  avatarId: "default", modal: "help", alertText: null, isFoodOpen: false, width: 1920, height: 1080, isVert: false, isPortrait: false, scale: 1, finalScale: 1, s: 1, styles: null, gameOverResult: null,
  userId: useApiStore.getState().user?.id ? Number(useApiStore.getState().user?.id) : null,

  addTestCoins: async () => {
    await useApiStore.getState().executeAction("mini_game_reward", 1, "memory");
  },

  buyFruit: async (slotId, fruitId, qty, cost) => {
    const auth = useApiStore.getState();
    if (auth.coins < cost) return false;
    const success = await auth.executeAction("buy_shop_items", cost);
    if (!success) return false;
    usePetStore.getState().addFruitsToInventory(slotId, fruitId, qty);
    return true;
  },

  setUsername: async (name) => {
    const cleanName = name.replace(/\s+/g, " ").trim();
    if (!cleanName) return;

    // ✅ ИСПРАВЛЕНИЕ: Больше не проверяем имя на уникальность через API.
    // Сразу сохраняем локально и обновляем UI, чтобы не рушить детскую психику ошибками базы данных.
    localStorage.setItem("local_saved_username", cleanName);
    set({ username: cleanName });

    try {
      const auth = useApiStore.getState();
      if (auth.user) useApiStore.setState({ user: { ...auth.user, name: cleanName } });
    } catch {
      // Игнорируем сетевые ошибки, так как локально имя уже применилось успешно
    }
  },

  setAvatarId: (id) => set({ avatarId: id }),

  addPetByCode: (code) => {
    const cleanCode = code.trim();
    if (!cleanCode) return false;
    const parsed = parseInt(cleanCode.replace(/\D/g, ""), 10);
    usePetStore.getState().unlockPet(!isNaN(parsed) ? parsed % 20 : (cleanCode.length % 19) + 1);
    return true;
  },

  resetStore: async () => {
    set({ avatarId: "default", modal: "help", alertText: null, isFoodOpen: false, gameOverResult: null, styles: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem("local_saved_username");
    }
    await useApiStore.getState().fetchCoins();
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

    if (difficulty === "memory") {
      finalRewardCoins = isWin ? 1 : 2;
    } else {
      isWin = difficulty ? initialIsWin : (numericScore >= 20 || numericScore === 999);
      if (difficulty) {
        finalRewardCoins = isWin ? (difficulty === "hard" ? 2 : 1) : 2;
      } else {
        finalRewardCoins = isWin ? 5 : 2;
      }
    }

    const rewardText = `+${finalRewardCoins}`;
    set({ gameOverResult: { isWin, rewardText } });
    await useApiStore.getState().executeAction("mini_game_reward", finalRewardCoins, difficulty || isWin);
  },

  clearGameOver: () => set({ gameOverResult: null })
}));

useApiStore.subscribe((state) => {
  if (state.user) {
    const localName = typeof window !== "undefined" ? localStorage.getItem("local_saved_username") : null;
    useMainGameStore.setState({
      coins: state.coins || 0,
      username: localName && localName.trim() ? localName.trim() : (state.user.name || "Игрок"),
      userId: state.user.id ? Number(state.user.id) : null
    });
  }
});
