import { StateCreator } from "zustand";
import { InventoryState, PetStateCombined } from "../usePetStore";

export const getInitInventory = () => ({
  cooldowns: { fruit_01: 0, fruit_02: 0, fruit_03: 0, fruit_04: 0 },
  counts: { fruit_01: 0, fruit_02: 0, fruit_03: 0, fruit_04: 0 },
  activeIds: { fruit_01: 1, fruit_02: 5, fruit_03: 9, fruit_04: 13 },
  currentId: ""
});

export const createInventorySlice: StateCreator<PetStateCombined, [], [], InventoryState> = (set, get) => ({
  inventory: getInitInventory(),

  selectFruitId: (id) => set((s) => ({ inventory: { ...s.inventory, currentId: s.inventory.currentId === id ? "" : id } })),

  useFruitId: (id, val, rHp, isStd = false) => {
    const { inventory, hp, currentAnim, playVideo } = get();
    if (!isStd && hp >= 100 && rHp) return "FULL_HP";
    const isEmpty = (inventory.counts[id] ?? 0) <= 0;
    const std = isStd || isEmpty;

    if (!std && performance.now() < (inventory.cooldowns[id] ?? 0)) return "COOLDOWN_OR_EMPTY";

    const nextHp = Math.min(100, hp + (std ? (hp < 10 ? 1 : 0) : rHp ? val : 0));
    let nextAnim = currentAnim;
    if (nextHp > 25 && currentAnim === "sad_state") {
      nextAnim = "prostoi1";
      playVideo(nextAnim);
    }

    const cdOffset = std ? 10000 : !rHp ? 180000 : val === 100 ? 300000 : val <= 25 ? 95000 : 180000;
    const nextCd = performance.now() + cdOffset;

    set({
      hp: nextHp,
      miniGamesClickCount: 0,
      currentAnim: nextAnim,
      inventory: {
        ...inventory,
        counts: std ? inventory.counts : { ...inventory.counts, [id]: inventory.counts[id] - 1 },
        cooldowns: std ? inventory.cooldowns : { ...inventory.cooldowns, [id]: nextCd },
        currentId: id && (std ? inventory.counts[id] : inventory.counts[id] - 1) <= 0 ? "" : inventory.currentId
      }
    });
    return "SUCCESS";
  },

  addFruitsToInventory: (slotId, fid, q) =>
    set((s) => ({
      inventory: {
        ...s.inventory,
        counts: { ...s.inventory.counts, [slotId]: (s.inventory.counts[slotId] ?? 0) + q },
        activeIds: { ...s.inventory.activeIds, [slotId]: fid }
      }
    }))
});
