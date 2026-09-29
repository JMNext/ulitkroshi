import { useApiStore } from "@/api/store/useApiStore";
import { isMock } from "@/api/api";
import { PET_LOCK_BUBBLES } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { StateCreator } from "zustand";
import { InventoryState, PetStateCombined } from "../usePetStore";
import { authApi } from "@/api/services/auth.api";

export const getInitInventory = () => ({
  cooldowns: { fruit_01: 0, fruit_02: 0, fruit_03: 0, fruit_04: 0 },
  counts: { fruit_01: 0, fruit_02: 0, fruit_03: 0, fruit_04: 0 },
  activeIds: { fruit_01: 1, fruit_02: 4, fruit_03: 7, fruit_04: 11 },
  currentId: "", dailyXpEarned: 0, dailyXpLimit: 15
});

const FRUIT_XP: Record<string, number> = { fruit_01: 1, fruit_02: 2, fruit_03: 5, fruit_04: 10 };

export const createInventorySlice: StateCreator<PetStateCombined, [], [], InventoryState> = (set, get) => ({
  inventory: getInitInventory(),
  selectFruitId: (id) => set((s) => ({ inventory: { ...s.inventory, currentId: id } })),
  useFruitId: (id, val, rHp, isStd = false) => {
    const { inventory, hp, stars, experience, activePetIndex, mood } = get();
    if (!isStd && hp >= 100 && rHp) return "FULL_HP";

    const count = inventory.counts[id] ?? 0;
    const std = isStd;
    const now = Date.now();
    if (!std && now < (inventory.cooldowns[id] ?? 0)) return "COOLDOWN_OR_EMPTY";

    get().playVideo("eat");
    const nextHp = Math.min(100, hp + (std ? (hp < 10 ? 1 : 0) : rHp ? val : 0));
    const offset = std ? 10000 : rHp ? (val === 100 ? 300000 : val <= 25 ? 95000 : 180000) : 180000;
    const nextMood = nextHp > 25 && mood === "sad" ? (Math.random() < 0.5 ? "happy" : "neutral") : mood;

    let nextXp = experience, nextStars = stars, nextDailyXp = inventory.dailyXpEarned ?? 0;

    if (!std && stars < 5) {
      const xpBonus = isMock ? 100 : (FRUIT_XP[id] || 1);
      if (isMock || nextDailyXp < (inventory.dailyXpLimit ?? 15)) {
        if (!isMock) nextDailyXp += Math.min(xpBonus, 15 - nextDailyXp);
        nextXp += isMock ? xpBonus : Math.min(xpBonus, 15 - nextDailyXp);
        if (nextXp >= 100) { nextStars = Math.min(5, stars + 1); nextXp = nextStars === 5 ? 0 : nextXp - 100; }

        const u = useApiStore.getState().user; const idx = activePetIndex || 0;
        if (u) {
          useApiStore.setState({ user: { ...u,
            petExperiences: (u.petExperiences || []).map((v, i) => i === idx ? nextXp : v),
            petStars: (u.petStars || []).map((v, i) => i === idx ? nextStars : v)
          } });
        }
      } else if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ui_show_bubble", { detail: { text: PET_LOCK_BUBBLES.fullHpStorePhrase || "" } }));
      }
    }

    authApi.syncPetStats(nextHp, nextXp, nextStars, activePetIndex || 0).catch(() => {});
    set({ hp: nextHp, mood: nextMood, experience: nextXp, stars: nextStars, miniGamesClickCount: 0, currentAnim: "eat",
      inventory: { ...inventory, dailyXpEarned: nextDailyXp, counts: { ...inventory.counts, [id]: Math.max(0, count - 1) }, cooldowns: { ...inventory.cooldowns, [id]: now + offset }, currentId: "" }
    });
    return "SUCCESS";
  },
  addFruitsToInventory: (slotId, fid, q) => set((s) => ({
    inventory: { ...s.inventory, counts: { ...s.inventory.counts, [slotId]: (s.inventory.counts[slotId] ?? 0) + q }, activeIds: { ...s.inventory.activeIds, [slotId]: fid } }
  }))
});
