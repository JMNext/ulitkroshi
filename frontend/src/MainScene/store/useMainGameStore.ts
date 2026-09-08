import { create } from "zustand";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";

import { useAuthStore } from "@/api/store/useAuthStore";
import { authApi } from "@/api/authApi";
import { AvatarId } from "@/MainScene/components/Avatars/Avatars";

interface MainGameState {
  coins: number;
  username: string;
  avatarId: AvatarId;
  modal: string | null;
  alertText: string | null;
  isFoodOpen: boolean;
  width: number;
  height: number;
  isVert: boolean;
  gameOverResult: { isWin: boolean; rewardText: string } | null;
  setCoins: (coins: number) => Promise<void>;
  addTestCoins: (amount: number) => Promise<void>;
  buyFruit: (
    slotId: string,
    fruitId: number,
    qty: number,
    cost: number
  ) => Promise<boolean>;
  setUsername: (name: string) => Promise<void>;
  setAvatarId: (id: AvatarId) => void;
  addPetByCode: (code: string) => boolean;
  resetStore: () => Promise<void>;
  setModal: (modal: string | null) => void;
  setAlertText: (text: string | null) => void;
  setIsFoodOpen: (
    open: boolean | ((prev: boolean) => boolean)
  ) => void;
  setDimensions: (w: number, h: number) => void;
  setGameOver: (
    score: number | undefined,
    difficulty: "easy" | "medium" | "hard" | undefined,
    initialIsWin: boolean
  ) => void;
  clearGameOver: () => void;
}

const DEFAULT_NAME = "Player001";
export const BASE_WIDTH = 1920;
export const BASE_HEIGHT = 1080;

const updateMockAndStoreName = (name: string) => {
  if (typeof (authApi as any).setMockName === "function") {
    (authApi as any).setMockName(name);
  }
  const auth = useAuthStore.getState();
  if (auth.user) {
    useAuthStore.setState({ user: { ...auth.user, name } });
  }
};

export const useMainGameStore = create<MainGameState>((set, get) => ({
  username: useAuthStore.getState().user?.name || DEFAULT_NAME,
  coins: useAuthStore.getState().coins,
  avatarId: "default",
  modal: "help",
  alertText: null,
  isFoodOpen: false,
  width: BASE_WIDTH,
  height: BASE_HEIGHT,
  isVert: false,
  gameOverResult: null,

  setCoins: async (targetCoins) => {
    const diff =
      Math.max(0, targetCoins) - useAuthStore.getState().coins;
    if (diff !== 0) await useAuthStore.getState().addCoins(diff);
  },

  addTestCoins: async (amount) => {
    await useAuthStore.getState().addCoins(amount);
  },

  buyFruit: async (slotId, fruitId, qty, cost) => {
    const auth = useAuthStore.getState();
    if (auth.coins < cost || !(await auth.spendCoins(cost)))
      return false;

    usePetStore.getState().addFruitsToInventory(slotId, fruitId, qty);
    return true;
  },

  setUsername: async (name) => {
    const cleanName = name.replace(/\s+/g, " ").trim();
    if (!cleanName) return;

    try {
      const check = await authApi.checkName(cleanName);
      if (!check.available) {
        set({ alertText: "Этот никнейм уже занят в базе данных!" });
        return;
      }
      updateMockAndStoreName(cleanName);
    } catch {
      set({ alertText: "Ошибка соединения с сервером базы данных." });
    }
  },

  setAvatarId: (id) => set({ avatarId: id }),

  addPetByCode: (code) => {
    const cleanCode = code.trim();
    if (!cleanCode) return false;

    const parsed = parseInt(cleanCode.replace(/\D/g, ""), 10);
    const petIndex = !isNaN(parsed)
      ? parsed % 20
      : (cleanCode.length % 19) + 1;

    usePetStore.getState().unlockPet(petIndex);
    return true;
  },

  resetStore: async () => {
    updateMockAndStoreName(DEFAULT_NAME);
    set({
      avatarId: "default",
      modal: "help",
      alertText: null,
      isFoodOpen: false,
      gameOverResult: null
    });
    await useAuthStore.getState().fetchCoins();
  },

  setModal: (modal) => set({ modal }),

  setAlertText: (alertText) => set({ alertText }),

  setIsFoodOpen: (open) =>
    set((s) => ({
      isFoodOpen:
        typeof open === "function" ? open(s.isFoodOpen) : open
    })),

  setDimensions: (w, h) =>
    set({ width: w, height: h, isVert: h > w }),

  setGameOver: (score, difficulty, initialIsWin) => {
    const isWin = difficulty
      ? initialIsWin
      : score !== undefined
        ? score === 999
          ? true
          : score >= 20
        : initialIsWin;

    const rewardText = difficulty
      ? isWin
        ? difficulty === "hard"
          ? "+2"
          : "+1"
        : "+0"
      : score === 999
        ? "+1"
        : isWin
          ? "+10"
          : "+3";

    set({ gameOverResult: { isWin, rewardText } });
  },

  clearGameOver: () => set({ gameOverResult: null })
}));

useAuthStore.subscribe((state) => {
  useMainGameStore.setState({
    coins: state.coins,
    username: state.user?.name || DEFAULT_NAME
  });
});
