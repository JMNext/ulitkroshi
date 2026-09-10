import { create } from "zustand";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { AvatarId } from "@/MainScene/components/Avatars/Avatars";
import { api } from "@/api/api";
import { useApiStore } from "@/api/store/useApiStore";

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
  addTestCoins: () => Promise<void>;
  buyFruit: (slotId: string, fruitId: number, qty: number, cost: number) => Promise<boolean>;
  setUsername: (name: string) => Promise<void>;
  setAvatarId: (id: AvatarId) => void;
  addPetByCode: (code: string) => boolean;
  resetStore: () => Promise<void>;
  setModal: (modal: string | null) => void;
  setAlertText: (text: string | null) => void;
  setIsFoodOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setDimensions: (w: number, h: number) => void;
  setGameOver: (score: number | undefined, difficulty: "easy" | "medium" | "hard" | undefined, initialIsWin: boolean) => Promise<void>;
  clearGameOver: () => void;
}

export const BASE_WIDTH = 1920;
export const BASE_HEIGHT = 1080;
const DEFAULT_NAME = "Player001";

const updateStoreName = (name: string) => {
  const auth = useApiStore.getState();
  if (auth.user) {
    useApiStore.setState({ user: { ...auth.user, name } });
  }
};

export const useMainGameStore = create<MainGameState>((set, get) => ({
  username: useApiStore.getState().user?.name || DEFAULT_NAME,
  coins: useApiStore.getState().coins ?? 0,
  avatarId: "default",
  modal: "help",
  alertText: null,
  isFoodOpen: false,
  width: BASE_WIDTH,
  height: BASE_HEIGHT,
  isVert: false,
  gameOverResult: null,

  addTestCoins: async () => {
    await useApiStore.getState().executeAction('mini_game_reward');
  },

  buyFruit: async (slotId, fruitId, qty, cost) => {
    const auth = useApiStore.getState();
    if ((auth.coins ?? 0) < cost) return false;

    const success = await auth.executeAction('buy_shop_items', cost);
    if (!success) return false;

    usePetStore.getState().addFruitsToInventory(slotId, fruitId, qty);
    return true;
  },

  setUsername: async (name) => {
    const cleanName = name.replace(/\s+/g, " ").trim();
    if (!cleanName) return;

    try {
      const check = await api.checkName(cleanName);
      if (!check.available) {
        set({ alertText: "Этот никнейм уже занят в базе данных!" });
        return;
      }
      updateStoreName(cleanName);
    } catch {
      set({ alertText: "Ошибка соединения с сервером базы данных." });
    }
  },

  setAvatarId: (id) => set({ avatarId: id }),

  addPetByCode: (code) => {
    const cleanCode = code.trim();
    if (!cleanCode) return false;

    const parsed = parseInt(cleanCode.replace(/\D/g, ""), 10);
    const petIndex = !isNaN(parsed) ? parsed % 20 : (cleanCode.length % 19) + 1;

    usePetStore.getState().unlockPet(petIndex);
    return true;
  },

  resetStore: async () => {
    updateStoreName(DEFAULT_NAME);
    set({
      avatarId: "default",
      modal: "help",
      alertText: null,
      isFoodOpen: false,
      gameOverResult: null
    });
    await useApiStore.getState().fetchCoins();
  },

  setModal: (modal) => set({ modal }),

  setAlertText: (alertText) => set({ alertText }),

  setIsFoodOpen: (open) =>
    set((s) => ({
      isFoodOpen: typeof open === "function" ? open(s.isFoodOpen) : open
    })),

  setDimensions: (w, h) =>
    set({ width: w, height: h, isVert: h > w }),

  setGameOver: async (score, difficulty, initialIsWin) => {
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

    if (isWin || score !== undefined) {
      await useApiStore.getState().executeAction('mini_game_reward');
    }
  },

  clearGameOver: () => set({ gameOverResult: null })
}));

useApiStore.subscribe((state) => {
  useMainGameStore.setState({
    coins: state.coins ?? 0,
    username: state.user?.name || DEFAULT_NAME
  });
});
