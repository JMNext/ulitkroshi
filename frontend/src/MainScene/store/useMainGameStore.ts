import { AvatarId } from "@/MainScene/components/Avatars/Avatars";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { api } from "@/api/api";
import { useApiStore } from "@/api/store/useApiStore";
import { create } from "zustand";

export interface MainGameStyles {
  header: React.CSSProperties;
  sideLeft: React.CSSProperties;
  sideRight: React.CSSProperties;
  food: React.CSSProperties;
  bottom: React.CSSProperties;
  pet: React.CSSProperties;
}

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
  scale: number;
  finalScale: number;
  s: number;
  styles: MainGameStyles | null;
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
  setLayoutData: (data: { scale: number; finalScale: number; s: number; width: number; height: number; styles: MainGameStyles }) => void;
  setGameOver: (score: number | undefined, difficulty: "easy" | "medium" | "hard" | undefined, initialIsWin: boolean) => Promise<void>;
  clearGameOver: () => void;
}

const DEFAULT_NAME = "Player001";
const updateStoreName = (name: string) => {
  const auth = useApiStore.getState();
  if (auth.user) useApiStore.setState({ user: { ...auth.user, name } });
};

export const useMainGameStore = create<MainGameState>((set, get) => ({
  username: useApiStore.getState().user?.name || DEFAULT_NAME,
  coins: useApiStore.getState().coins ?? 0,
  avatarId: "default",
  modal: "help",
  alertText: null,
  isFoodOpen: false,
  width: 1920,
  height: 1080,
  isVert: false,
  scale: 1,
  finalScale: 1,
  s: 1,
  styles: null,
  gameOverResult: null,

  addTestCoins: async () => {
    await useApiStore.getState().executeAction("mini_game_reward");
  },
  buyFruit: async (slotId, fruitId, qty, cost) => {
    const auth = useApiStore.getState();
    if ((auth.coins ?? 0) < cost) return false;
    const success = await auth.executeAction("buy_shop_items", cost);
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
    usePetStore.getState().unlockPet(!isNaN(parsed) ? parsed % 20 : (cleanCode.length % 19) + 1);
    return true;
  },
  resetStore: async () => {
    updateStoreName(DEFAULT_NAME);
    set({ avatarId: "default", modal: "help", alertText: null, isFoodOpen: false, gameOverResult: null, styles: null });
    await useApiStore.getState().fetchCoins();
  },
  setModal: (modal) => set({ modal }),
  setAlertText: (alertText) => set({ alertText }),
  setIsFoodOpen: (open) => set((s) => ({ isFoodOpen: typeof open === "function" ? open(s.isFoodOpen) : open })),

  setLayoutData: (data) =>
    set({
      scale: data.scale,
      finalScale: data.finalScale,
      s: data.s,
      styles: data.styles,
      width: data.width,
      height: data.height,
      isVert: data.height > data.width
    }),

  setGameOver: async (score, difficulty, initialIsWin) => {
    const isWin = difficulty ? initialIsWin : score !== undefined ? (score === 999 ? true : score >= 20) : initialIsWin;
    const rewardText = difficulty ? (isWin ? (difficulty === "hard" ? "+2" : "+1") : "+0") : score === 999 ? "+1" : isWin ? "+10" : "+3";
    set({ gameOverResult: { isWin, rewardText } });
    if (isWin || score !== undefined) await useApiStore.getState().executeAction("mini_game_reward");
  },
  clearGameOver: () => set({ gameOverResult: null })
}));

useApiStore.subscribe((state) => {
  useMainGameStore.setState({ coins: state.coins ?? 0, username: state.user?.name || DEFAULT_NAME });
});
