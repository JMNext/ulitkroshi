import { StateCreator } from "zustand";
import { InventoryState, PetStateCombined } from "../usePetStore";

export const getInitInventory = () => ({
  cooldowns: { fruit_01: 0, fruit_02: 0, fruit_03: 0, fruit_04: 0 },
  counts: { fruit_01: 0, fruit_02: 0, fruit_03: 0, fruit_04: 0 },
  activeIds: { fruit_01: 1, fruit_02: 4, fruit_03: 7, fruit_04: 11 },
  currentId: ""
});

export const createInventorySlice: StateCreator<PetStateCombined, [], [], InventoryState> = (set, get) => ({
  inventory: getInitInventory(),

  selectFruitId: (id) => set((s) => ({
    inventory: { ...s.inventory, currentId: s.inventory.currentId === id ? "" : id }
  })),

  useFruitId: (id, val, rHp, isStd = false) => {
    const { inventory, hp, currentAnim, playVideo } = get();
    if (!isStd && hp >= 100 && rHp) return "FULL_HP";

    const count = inventory.counts[id] ?? 0;
    const std = isStd || count <= 0;
    const now = Date.now();
    if (!std && now < (inventory.cooldowns[id] ?? 0)) return "COOLDOWN_OR_EMPTY";

    let anim = currentAnim;
    if (Math.min(100, hp + (std ? (hp < 10 ? 1 : 0) : rHp ? val : 0)) > 25 && currentAnim === "sad_state") {
      anim = "prostoi1"; playVideo(anim);
    }

    const nextHp = Math.min(100, hp + (std ? (hp < 10 ? 1 : 0) : rHp ? val : 0));
    const offset = std ? 10000 : rHp ? (val === 100 ? 300000 : val <= 25 ? 95000 : 180000) : 180000;
    const nextCount = count - 1;

    set({
      hp: nextHp, miniGamesClickCount: 0, currentAnim: anim,
      inventory: {
        ...inventory,
        counts: std ? inventory.counts : { ...inventory.counts, [id]: nextCount },
        cooldowns: std ? inventory.cooldowns : { ...inventory.cooldowns, [id]: now + offset },
        currentId: !std && nextCount <= 0 ? "" : inventory.currentId
      }
    });
    return "SUCCESS";
  },

  addFruitsToInventory: (slotId, fid, q) => set((s) => ({
    inventory: {
      ...s.inventory,
      counts: { ...s.inventory.counts, [slotId]: (s.inventory.counts[slotId] ?? 0) + q },
      activeIds: { ...s.inventory.activeIds, [slotId]: fid }
    }
  }))
});
