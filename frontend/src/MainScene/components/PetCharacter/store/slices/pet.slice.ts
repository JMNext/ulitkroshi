import { PET_LOCK_BUBBLES } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { useApiStore } from "@/api/store/useApiStore";
import { StateCreator } from "zustand";
import { PetLogicState, PetStateCombined } from "../usePetStore";

const SLEEP_ANIMS = ["sleep_circle", "sleep_begin", "sleep_awake"];
const BASE_ANIMS = ["prostoi1", "prostoi2", "sad_state"];
let timerId: any = null;

const syncHp = (hp: number) => {
  const u = useApiStore.getState().user;
  if (u) useApiStore.setState({ user: { ...u, petHealth: hp } });
};

const clearTimer = () => { if (timerId) { clearInterval(timerId); timerId = null; } };

export const createPetLogicSlice: StateCreator<PetStateCombined, [], [], PetLogicState> = (set, get) => ({
  hp: 100, miniGamesClickCount: 0, activePetIndex: 0, unlockedPetIndexes:[0], currentAnim: "prostoi1", washState: "idle",

  canExecuteAction: (type) => SLEEP_ANIMS.includes(get().currentAnim) ? type === "sleep" : BASE_ANIMS.includes(get().currentAnim),

  triggerCareAction: (action) => set({ currentAnim: action, washState: "hidden" }),

  completeCareAction: () => {
    const { currentAnim, hp } = get();

    if (currentAnim === "sleep_begin") {
      set({ currentAnim: "sleep_circle", washState: "hidden" });
      clearTimer();

      timerId = setInterval(() => {
        const next = Math.min(100, get().hp + 25);
        set({ hp: next });
        syncHp(next);

        if (next >= 100) { clearTimer(); get().triggerSleepAction(); }
      }, 60000);
      return;
    }

    if (currentAnim === "sleep_awake") {
      window.dispatchEvent(new CustomEvent("ui_show_bubble", { detail: { text: null } }));
      useMainGameStore.getState().setAlertText(null);
    }

    const next = hp <= 25 ? "sad_state" : ["wash", "play", "eat"].includes(currentAnim) && Math.random() < 0.3 ? "prostoi2" : "prostoi1";
    set({ currentAnim: next, washState: next.startsWith("sleep") ? "hidden" : "idle" });
  },

  triggerSleepAction: () => {
    const { currentAnim } = get();
    if (BASE_ANIMS.includes(currentAnim)) get().triggerCareAction("sleep_begin");
    else if (currentAnim === "sleep_circle" || currentAnim === "sleep_begin") { clearTimer(); get().triggerCareAction("sleep_awake"); }
  },

  incrementMiniGamesClick: () => {
    if (SLEEP_ANIMS.includes(get().currentAnim)) return PET_LOCK_BUBBLES.sleepAlert;
    set((s) => ({ miniGamesClickCount: s.miniGamesClickCount + 1 }));
    const p = [...PET_LOCK_BUBBLES.funnyPhrases, PET_LOCK_BUBBLES.default];
    return p[Math.floor(Math.random() * p.length)];
  },

  unlockPet: async (idx) => {
    const ids = get().unlockedPetIndexes;
    if (!ids.includes(idx)) set({ unlockedPetIndexes: [...ids, idx] });
  },

  handleGameLoss: () => {
    const next = Math.max(1, get().hp - 25);
    set({ hp: next, currentAnim: next <= 25 && !SLEEP_ANIMS.includes(get().currentAnim) ? "sad_state" : get().currentAnim });
    syncHp(next);
  }
});
