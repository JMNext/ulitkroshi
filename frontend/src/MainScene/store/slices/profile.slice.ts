import { useApiStore } from "@/api/store/useApiStore";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { StateCreator } from "zustand";
import { MainGameStateCombined, ProfileState } from "../useMainGameStore";

export const getInitialUsername = (): string => {
  if (typeof window !== "undefined") {
    const localName = localStorage.getItem("local_saved_username");
    if (localName && localName.trim()) return localName.trim();
  }
  const user = useApiStore.getState().user;
  if (user?.name) return user.name.trim();
  return user?.id ? `Player_${user.id}` : "Player_12345";
};

export const createProfileSlice: StateCreator<MainGameStateCombined, [], [], ProfileState> = (set, get) => ({
  username: getInitialUsername(),
  coins: useApiStore.getState().coins || 0,
  avatarId: "default",
  userId: useApiStore.getState().user?.id ? Number(useApiStore.getState().user?.id) : null,

  buyFruit: async (slotId, fruitId, qty, cost) => {
    const auth = useApiStore.getState();
    const safeCost = Math.round(cost);

    if (get().coins < safeCost) return false;
    get().setUpdatingCoinsGlobal(true);

    const currentCoins = get().coins;
    const exactNextCoins = Math.max(0, currentCoins - safeCost);

    set({ coins: exactNextCoins });

    try {
      await auth.executeAction("buy_shop_items", safeCost);
      if (auth.user) {
        auth.coins = exactNextCoins;
      }
      set({ coins: exactNextCoins });
    } catch (err) {
      console.error("🚨 [PROFILE SLICE BUY FRUIT CATCH ERROR]:", err);
      set({ coins: currentCoins });
    } finally {
      get().setUpdatingCoinsGlobal(false);
    }

    usePetStore.getState().addFruitsToInventory(slotId, fruitId, qty);
    return true;
  },

  setUsername: async (name) => {
    const cleanName = name.trim();
    if (!cleanName) return;

    if (typeof window !== "undefined") {
      localStorage.setItem("local_saved_username", cleanName);
    }
    set({ username: cleanName });

    const apiUser = useApiStore.getState().user;
    if (apiUser) {
      useApiStore.setState({ user: { ...apiUser, name: cleanName } });
    }
  },

  setAvatarId: (id) => set({ avatarId: id }),

  addPetByCode: (code) => {
    const cleanCode = code.trim();
    if (!cleanCode) return false;
    const parsed = parseInt(cleanCode.replace(/\D/g, ""), 10);
    usePetStore.getState().unlockPet(!isNaN(parsed) ? parsed % 20 : (cleanCode.length % 19) + 1);
    return true;
  }
});
