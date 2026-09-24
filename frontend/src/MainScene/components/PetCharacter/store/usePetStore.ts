import { create } from "zustand";
import { createInventorySlice, getInitInventory } from "./slices/inventory.slice";
import { createPetLogicSlice } from "./slices/pet.slice";
import { useApiStore } from "@/api/store/useApiStore";
import { UserProfile } from "@/api/types/types";

export type PetMood = "happy" | "neutral" | "sad";

export interface InventoryState {
  inventory: {
    cooldowns: Record<string, number>;
    counts: Record<string, number>;
    activeIds: Record<string, number>;
    currentId: string;
    dailyXpEarned: number;
    dailyXpLimit: number;
  };
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
  mood: PetMood;
  experience: number;
  stars: number;
  buffUntil: number;
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
  hasBuffActive: () => boolean;
  getVideoElements: () => Record<string, HTMLVideoElement | null>;
  registerVideoElement: (key: string, el: HTMLVideoElement | null) => void;
  updateField: <K extends keyof PetStateCombined>(field: K, value: PetStateCombined[K]) => void;
  playVideo: (key: string) => void;
  resetStore: () => void;
}

let _videos: Record<string, HTMLVideoElement | null> = {};
const defaultUnlockedIndexes = [0];

export const usePetStore = create<PetStateCombined>()((set, get, ...a) => ({
  petName: "Булька",
  petTargetX: 960,
  petTargetY: 518,

  ...createInventorySlice(set, get, ...a),
  ...createPetLogicSlice(set, get, ...a),

  hasBuffActive: () => get().buffUntil > Date.now(),
  getVideoElements: () => _videos,

  registerVideoElement: (key, el) => {
    if (el) _videos[key] = el;
    else delete _videos[key];
  },

  updateField: (field, value) => set((s) => {
    let anim = s.currentAnim;
    let currentMood = s.mood;

    if (field === "mood") currentMood = value as PetMood;

    if (field === "hp") {
      const hp = Number(value ?? 100);
      if (hp <= 25) {
        currentMood = "sad";
        if (anim === "prostoi1" || anim === "prostoi2") anim = "sad_state";
      } else if (hp > 25 && anim === "sad_state" && s.mood !== "sad") {
        anim = "prostoi1";
      }
    }

    return { ...s, [field]: value, mood: currentMood, currentAnim: anim };
  }),

  playVideo: (key) => {
    const video = _videos[key];
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  },

  resetStore: () => {
    set({
      petName: "Булька", hp: 100, mood: "happy", experience: 0, stars: 1, miniGamesClickCount: 0, activePetIndex: 0,
      unlockedPetIndexes: defaultUnlockedIndexes, currentAnim: "prostoi1", washState: "idle", petTargetX: 960, petTargetY: 518,
      buffUntil: 0, inventory: getInitInventory()
    });
    _videos = {};
    localStorage.setItem("mock_unlocked_pets", JSON.stringify(defaultUnlockedIndexes));
  }
}));

useApiStore.subscribe((state) => {
  const u = state.user as UserProfile | null;
  if (!u) return;

  const idx = usePetStore.getState().activePetIndex || 0;

  const currentName = Array.isArray(u.petNames) && u.petNames[idx] ? u.petNames[idx] : "Булька";

  const rawHp = Array.isArray(u.petHealths) ? u.petHealths[idx] : undefined;

  // Важное исправление: если в моках прилетает 0, принудительно выставляем 100% здоровья на старте
  let currentHp = rawHp !== undefined && rawHp !== null ? Number(rawHp) : 100;
  if (currentHp <= 0) {
    currentHp = 100;
  }

  const rawXp = Array.isArray(u.petExperiences) ? u.petExperiences[idx] : undefined;
  const currentXp = rawXp !== undefined && rawXp !== null ? Number(rawXp) : 0;

  const rawStars = Array.isArray(u.petStars) ? u.petStars[idx] : undefined;
  const currentStars = rawStars !== undefined && rawStars !== null ? Number(rawStars) : 1;

  const count = typeof u.unlockedPets === "number" ? u.unlockedPets : 1;

  usePetStore.setState({
    petName: currentName,
    hp: isNaN(currentHp) ? 100 : currentHp,
    experience: isNaN(currentXp) ? 0 : currentXp,
    stars: isNaN(currentStars) ? 1 : currentStars,
    unlockedPetIndexes: Array.from(new Array(count).keys())
  });
});
