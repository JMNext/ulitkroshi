import { authApiInstance } from "@/api/api";
import { useApiStore } from "@/api/store/useApiStore";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { StateCreator } from "zustand";
import { MainGameStateCombined, ProfileState } from "../useMainGameStore";

export const createProfileSlice: StateCreator<MainGameStateCombined, [], [], ProfileState> = (set, get) => ({
  username: "",
  discriminator: "0000",
  coins: 0,
  avatarId: "default",
  userId: null,

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
      const currentUser = auth.user;
      if (currentUser) {
        useApiStore.setState({ user: { ...currentUser, coins: nextCoins } });
      }
    } catch {
      set({ coins: prevCoins });
    } finally {
      get().setUpdatingCoinsGlobal(false);
    }

    usePetStore.getState().addFruitsToInventory(slotId, fruitId, qty);
    return true;
  },

  setUsername: async (name) => {
    let clean = "";
    if (name) {
      const parts = name.split("#");
      const firstPart = parts.shift();
      if (firstPart) clean = firstPart.trim();
    }
    if (!clean) return;

    const currentUserId = get().userId || useApiStore.getState().user?.id;
    const currentDiscriminator = get().discriminator || "0000";

    if (typeof window !== "undefined" && currentUserId) {
      localStorage.setItem(`local_saved_username_${currentUserId}`, clean);
    }

    set({
      username: clean,
      discriminator: currentDiscriminator
    });

    try {
      const currentUser = useApiStore.getState().user;
      if (currentUser) {
        useApiStore.setState({
          user: { ...currentUser, player_name: clean }
        });
      }
      await authApiInstance.put("/auth/profile/update", { player_name: clean });
    } catch (e) {
      console.error("Ошибка сохранения имени на сервере:", e);
    }
  },

  setAvatarId: (id) => set({ avatarId: id }),

  addPetByCode: (code) => {
    const clean = code.trim();
    if (!clean) return false;
    const cleanDigits = clean.replace(/\D/g, "");
    const num = parseInt(cleanDigits, 10);

    let targetIdx = (clean.length % 19) + 1;
    if (cleanDigits && !isNaN(num)) {
      targetIdx = num % 20;
    }

    usePetStore.getState().unlockPet(targetIdx).catch(() => {});
    return true;
  }
});
