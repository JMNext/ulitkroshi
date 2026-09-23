import { useApiStore } from "@/api/store/useApiStore";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { StateCreator } from "zustand";
import { MainGameStateCombined, ProfileState } from "../useMainGameStore";

const getInit = (type: "name" | "disc") => {
  const u = useApiStore.getState().user as any;
  if (type === "name") {
    const local = typeof window !== "undefined" ? localStorage.getItem("local_saved_username") : null;
    return local?.trim() || u?.name?.trim() || "Player";
  }
  if (u?.discriminator) return String(u.discriminator).trim();
  return u?.name?.includes("#") ? u.name.split("#").pop() || "0000" : "0000";
};

export const createProfileSlice: StateCreator<MainGameStateCombined, [], [], ProfileState & { discriminator: string }> = (set, get) => ({
  username: getInit("name"),
  discriminator: getInit("disc"),
  coins: useApiStore.getState().coins || 0,
  avatarId: "default",
  userId: useApiStore.getState().user?.id ? Number(useApiStore.getState().user?.id) : null,

  buyFruit: async (slotId, fruitId, qty, cost) => {
    const auth = useApiStore.getState();
    const safeCost = Math.round(cost);
    if (get().coins < safeCost) return false;

    get().setUpdatingCoinsGlobal(true);
    const prevCoins = get().coins;
    const nextCoins = Math.max(0, prevCoins - safeCost);
    set({ coins: nextCoins });

    try {
      await auth.executeAction("buy_shop_items", safeCost);
      if (auth.user) auth.coins = nextCoins;
    } catch {
      set({ coins: prevCoins });
    } finally {
      get().setUpdatingCoinsGlobal(false);
    }

    usePetStore.getState().addFruitsToInventory(slotId, fruitId, qty);
    return true;
  },

  setUsername: async (name) => {
    const clean = (name || "").split("#")[0]?.trim();
    if (!clean) return;
    if (typeof window !== "undefined") localStorage.setItem("local_saved_username", clean);
    set({ username: clean });
  },

  setAvatarId: (id) => set({ avatarId: id }),

  addPetByCode: (code) => {
    const clean = code.trim();
    if (!clean) return false;
    const num = parseInt(clean.replace(/\D/g, ""), 10);
    usePetStore.getState().unlockPet(!isNaN(num) ? num % 20 : (clean.length % 19) + 1);
    return true;
  }
});
