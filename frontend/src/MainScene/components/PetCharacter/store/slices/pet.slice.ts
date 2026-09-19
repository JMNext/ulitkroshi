import { PET_LOCK_BUBBLES } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { api } from "@/api/api";
import { useApiStore } from "@/api/store/useApiStore";
import { StateCreator } from "zustand";
import { PetLogicState, PetStateCombined } from "../usePetStore";

const SLEEP_ANIMS = ["sleep_circle", "sleep_begin", "sleep_awake"];
const BASE_ANIMS = ["prostoi1", "prostoi2", "sad_state"];

export const createPetLogicSlice: StateCreator<PetStateCombined, [], [], PetLogicState> = (set, get) => ({
  hp: 100,
  miniGamesClickCount: 0,
  activePetIndex: 0,
  unlockedPetIndexes:[0],
  currentAnim: "prostoi1",
  washState: "idle",

  canExecuteAction: (type) => (SLEEP_ANIMS.includes(get().currentAnim) ? type === "sleep" : BASE_ANIMS.includes(get().currentAnim)),

  triggerCareAction: async (action) => {
    set({ currentAnim: action, washState: "hidden" });

    if (action === "eat") {
      try {
        const updatedUser = await api.feedPet();
        set({ hp: updatedUser.petHealth });
        const currentUser = useApiStore.getState().user;
        if (currentUser) {
          useApiStore.setState({ user: { ...currentUser, petHealth: updatedUser.petHealth } });
        }
      } catch {}
    }
  },

  completeCareAction: () => {
    const { currentAnim, hp } = get();
    let next = "prostoi1";

    if (currentAnim === "sleep_begin") {
      set({ currentAnim: "sleep_circle", washState: "hidden" });
      return;
    }

    if (currentAnim === "sleep_awake") {
      window.dispatchEvent(new CustomEvent("ui_show_bubble", { detail: { text: null } }));
      useMainGameStore.getState().setAlertText(null);
      next = hp <= 25 ? "sad_state" : "prostoi1";
    } else if (["wash", "play", "eat"].includes(currentAnim)) {
      next = hp <= 25 ? "sad_state" : Math.random() < 0.3 ? "prostoi2" : "prostoi1";
    }

    set({ currentAnim: next, washState: next.startsWith("sleep") ? "hidden" : "idle" });
  },

  triggerSleepAction: () => {
    const { currentAnim } = get();
    if (BASE_ANIMS.includes(currentAnim)) {
      get().triggerCareAction("sleep_begin");
    } else if (currentAnim === "sleep_circle" || currentAnim === "sleep_begin") {
      get().triggerCareAction("sleep_awake");
    }
  },

  incrementMiniGamesClick: () => {
    if (SLEEP_ANIMS.includes(get().currentAnim)) return PET_LOCK_BUBBLES.sleepAlert;
    const nextCount = get().miniGamesClickCount + 1;
    set({ miniGamesClickCount: nextCount });
    return nextCount >= PET_LOCK_BUBBLES.triggerCount
      ? PET_LOCK_BUBBLES.funnyPhrases[Math.floor(Math.random() * PET_LOCK_BUBBLES.funnyPhrases.length)]
      : PET_LOCK_BUBBLES.default;
  },

  unlockPet: async (index) => {
    const idxs = get().unlockedPetIndexes;
    if (idxs.includes(index)) return;
    set({ unlockedPetIndexes: [...idxs, index] });
  },

  handleGameLoss: () => {
    const nh = Math.max(1, get().hp - 25);
    const next = nh <= 25 && !SLEEP_ANIMS.includes(get().currentAnim) ? "sad_state" : get().currentAnim;
    set({ hp: nh, currentAnim: next });
    const currentUser = useApiStore.getState().user;
    if (currentUser) {
      useApiStore.setState({ user: { ...currentUser, petHealth: nh } });
    }
  }
});
