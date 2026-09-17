import { PET_LOCK_BUBBLES } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { api } from "@/api/api";
import { useApiStore } from "@/api/store/useApiStore";
import { create } from "zustand";

export interface PetState {
  petName: string;
  hp: number;
  miniGamesClickCount: number;
  activePetIndex: number;
  unlockedPetIndexes: number[];
  currentAnim: string;
  washState: "idle" | "hidden" | "glowing";
  fruitsCooldowns: Record<string, number>;
  fruitsCounts: Record<string, number>;
  activeFruitIds: Record<string, number>;
  currentFruitId: string;
  petTargetX: number;
  petTargetY: number;
  updateField: <K extends keyof PetState>(field: K, value: PetState[K]) => void;
  setPetTargetCoordinates: (x: number, y: number) => void;
  setCurrentFruitId: (id: string) => void;
  selectFruitId: (id: string) => void;
  canExecuteAction: (type: "feed" | "wash" | "play" | "sleep") => boolean;
  triggerCareAction: (action: "wash" | "play" | "eat") => void;
  completeCareAction: () => void;
  triggerSleepAction: () => void;
  incrementMiniGamesClick: () => string;
  useFruitId: (id: string, val: number, rHp: boolean, isStandard?: boolean) => "SUCCESS" | "FULL_HP" | "COOLDOWN_OR_EMPTY";
  addFruitsToInventory: (slotId: string, fid: number, q: number) => void;
  unlockPet: (index: number) => Promise<void>;
  handleGameLoss: () => void;
  resetStore: () => void;
}

const SLEEP_ANIMATIONS = ["sleep_circle", "sleep_begin", "sleep_awake"];
const BASE_ANIMATIONS = ["prostoi1", "prostoi2", "sad_state"];

const initialFruits = {
  fruitsCooldowns: { fruit_01: 0, fruit_02: 0, fruit_03: 0, fruit_04: 0 },
  fruitsCounts: { fruit_01: 0, fruit_02: 0, fruit_03: 0, fruit_04: 0 },
  activeFruitIds: { fruit_01: 1, fruit_02: 5, fruit_03: 9, fruit_04: 13 }
};

export const usePetStore = create<PetState>((set, get) => ({
  petName: useApiStore.getState().user?.petName || "Улитка",
  hp: 100,
  miniGamesClickCount: 0,
  activePetIndex: 0,
  unlockedPetIndexes: Array.of(0),
  currentAnim: "prostoi1",
  washState: "idle",
  ...initialFruits,
  currentFruitId: "",
  petTargetX: 960,
  petTargetY: 518,

  updateField: (field, value) => set((state) => ({ ...state, [field]: value })),

  setPetTargetCoordinates: (x, y) => set({ petTargetX: x, petTargetY: y }),

  setCurrentFruitId: (id) => set({ currentFruitId: id }),

  selectFruitId: (id) => set((state) => ({ currentFruitId: state.currentFruitId === id ? "" : id })),

  canExecuteAction: (type) => {
    const anim = get().currentAnim;
    return SLEEP_ANIMATIONS.includes(anim) ? type === "sleep" : BASE_ANIMATIONS.includes(anim);
  },

  triggerCareAction: (action) => set({ currentAnim: action, washState: "hidden" }),

  completeCareAction: () => {
    const { currentAnim, hp } = get();
    if (currentAnim === "sleep_begin") return set({ currentAnim: "sleep_circle" });
    if (currentAnim === "sleep_awake") {
      window.dispatchEvent(new CustomEvent("ui_show_bubble", { detail: { text: null } }));
      useMainGameStore.getState().setAlertText(null);
      return set({ currentAnim: hp <= 25 ? "sad_state" : "prostoi1", washState: "idle" });
    }
    if (["wash", "play", "eat"].includes(currentAnim)) {
      set({
        currentAnim: hp <= 25 ? "sad_state" : Math.random() < 0.3 ? "prostoi2" : "prostoi1",
        washState: "idle"
      });
    }
  },

  triggerSleepAction: () => {
    const a = get().currentAnim;
    if (BASE_ANIMATIONS.includes(a)) {
      set({ currentAnim: "sleep_begin", washState: "hidden" });
    } else if (a === "sleep_circle") {
      set({ currentAnim: "sleep_awake", washState: "hidden" });
    }
  },

  incrementMiniGamesClick: () => {
    const { currentAnim, miniGamesClickCount } = get();
    if (SLEEP_ANIMATIONS.includes(currentAnim)) return PET_LOCK_BUBBLES.sleepAlert;
    const nextCount = miniGamesClickCount + 1;
    set({ miniGamesClickCount: nextCount });
    if (nextCount >= PET_LOCK_BUBBLES.triggerCount) {
      const phrases = PET_LOCK_BUBBLES.funnyPhrases;
      return phrases[Math.floor(Math.random() * phrases.length)];
    }
    return PET_LOCK_BUBBLES.default;
  },

  useFruitId: (id, val, rHp, isStandard = false) => {
    const { fruitsCooldowns, fruitsCounts, hp, currentAnim } = get();
    if (!isStandard && hp >= 100 && rHp) return "FULL_HP";
    const isFruitEmpty = (fruitsCounts[id] ?? 0) <= 0;
    const actualStd = isStandard || isFruitEmpty;
    const actualVal = actualStd && isFruitEmpty ? 1 : val;
    const actualRHp = rHp || isFruitEmpty;
    const now = Date.now();
    if (!actualStd && now < (fruitsCooldowns[id] ?? 0)) return "COOLDOWN_OR_EMPTY";
    const cd = actualStd ? 10000 : !actualRHp ? 180000 : actualVal === 100 ? 300000 : actualVal <= 25 ? 95000 : 180000;
    const nextHp = Math.min(100, hp + (actualStd ? (hp < 10 ? 1 : 0) : actualRHp ? actualVal : 0));
    const nextCounts = actualStd ? { ...fruitsCounts } : { ...fruitsCounts, [id]: fruitsCounts[id] - 1 };
    set({
      hp: nextHp,
      miniGamesClickCount: 0,
      currentAnim: nextHp > 25 && currentAnim === "sad_state" ? "prostoi1" : currentAnim,
      fruitsCounts: nextCounts,
      fruitsCooldowns: actualStd ? { ...fruitsCooldowns } : { ...fruitsCooldowns, [id]: now + cd },
      currentFruitId: id && (nextCounts[id] ?? 0) <= 0 ? "" : get().currentFruitId
    });
    return "SUCCESS";
  },

  addFruitsToInventory: (slotId, fid, q) =>
    set((state) => ({
      fruitsCounts: { ...state.fruitsCounts, [slotId]: (state.fruitsCounts[slotId] ?? 0) + q },
      activeFruitIds: { ...state.activeFruitIds, [slotId]: fid }
    })),

  unlockPet: async (index) => {
    const idxs = get().unlockedPetIndexes;
    if (idxs.includes(index)) return;
    const up = [...idxs, index];
    set({ unlockedPetIndexes: up });
    try {
      await api.updateUnlockedPets(up);
    } catch (e) {
      set({ unlockedPetIndexes: idxs });
    }
  },

  handleGameLoss: () => {
    const { hp, currentAnim } = get();
    const nh = Math.max(1, hp - 25);
    set({
      hp: nh,
      currentAnim: nh <= 25 && !SLEEP_ANIMATIONS.includes(currentAnim) ? "sad_state" : currentAnim
    });
  },

  resetStore: () => {
    set((state) => ({
      hp: 100,
      miniGamesClickCount: 0,
      activePetIndex: 0,
      unlockedPetIndexes: Array.of(0),
      currentAnim: "prostoi1",
      washState: "idle",
      ...initialFruits,
      currentFruitId: "",
      petTargetX: 960,
      petTargetY: 518,
      petName: state.petName
    }));
    localStorage.setItem("mock_unlocked_pets", JSON.stringify(Array.of(0)));
  }
}));

useApiStore.subscribe((state) => {
  if (state.user) {
    usePetStore.setState({
      petName: state.user.petName || "Улитка"
    });
  }
});
