import { useApiStore } from "@/api/store/useApiStore";
import { create } from "zustand";
import { createInventorySlice, getInitInventory } from "./slices/inventory.slice";
import { createPetLogicSlice } from "./slices/pet.slice";

export interface InventoryState {
  inventory: { cooldowns: Record<string, number>; counts: Record<string, number>; activeIds: Record<string, number>; currentId: string };
  selectFruitId: (id: string) => void;
  useFruitId: (id: string, val: number, rHp: boolean, isStd?: boolean) => "SUCCESS" | "FULL_HP" | "COOLDOWN_OR_EMPTY";
  addFruitsToInventory: (slotId: string, fid: number, q: number) => void;
}

export interface PetLogicState {
  hp: number;
  miniGamesClickCount: number;
  activePetIndex: number;
  unlockedPetIndexes: number[];
  currentAnim: string;
  washState: "idle" | "hidden" | "glowing";
  canExecuteAction: (type: "feed" | "wash" | "play" | "sleep") => boolean;
  triggerCareAction: (action: "wash" | "play" | "eat" | "sleep_begin" | "sleep_awake") => void;
  completeCareAction: () => void;
  triggerSleepAction: () => void;
  incrementMiniGamesClick: () => string;
  unlockPet: (index: number) => Promise<void>;
  handleGameLoss: () => void;
}

export interface PetStateCombined extends InventoryState, PetLogicState {
  petName: string;
  petTargetX: number;
  petTargetY: number;
  getVideoElements: () => Record<string, HTMLVideoElement | null>;
  registerVideoElement: (key: string, el: HTMLVideoElement | null) => void;
  updateField: <K extends keyof PetStateCombined>(field: K, value: PetStateCombined[K]) => void;
  playVideo: (key: string) => void;
  resetStore: () => void;
}

let _videos: Record<string, HTMLVideoElement | null> = {};

export const usePetStore = create<PetStateCombined>()((set, get, ...a) => ({
  petName: useApiStore.getState().user?.petName || "Улитка",
  petTargetX: 960,
  petTargetY: 518,

  ...createInventorySlice(set, get, ...a),
  ...createPetLogicSlice(set, get, ...a),

  getVideoElements: () => _videos,
  registerVideoElement: (key, el) => {
    if (!el) {
      delete _videos[key];
    } else {
      _videos[key] = el;
    }
  },
  updateField: (field, value) => set((state) => ({ ...state, [field]: value })),

  playVideo: (key) => {
    const v = _videos[key];
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  },

  resetStore: () => {
    set({
      hp: 100,
      miniGamesClickCount: 0,
      activePetIndex: 0,
      unlockedPetIndexes:[0],
      currentAnim: "prostoi1",
      washState: "idle",
      petTargetX: 960,
      petTargetY: 518,
      inventory: getInitInventory()
    });
    Object.keys(_videos).forEach((k) => {
      const v = _videos[k];
      if (v) {
        v.pause();
        v.removeAttribute("src");
        v.load();
      }
    });
    _videos = {};
    localStorage.setItem("mock_unlocked_pets", JSON.stringify([0]));
  }
}));

useApiStore.subscribe((s) => s.user && usePetStore.setState({ petName: s.user.petName || "Улитка" }));
