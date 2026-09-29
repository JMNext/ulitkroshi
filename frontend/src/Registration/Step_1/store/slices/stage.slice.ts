import { StateCreator } from "zustand";
import { StageState, Step1StateCombined } from "../useRegistrationStep1Store";

export const createStageSlice: StateCreator<Step1StateCombined, [], [], StageState> = (set, get) => ({
  stage: 1, nameHistory: [], layoutContext: null, finalScale: 1,

  setLayout: (layoutContext, finalScale) => set({ layoutContext, finalScale }),

  setStage: (stage) => {
    const s = get();
    if (stage === 1 && s.stage === 2) {
      set({
        stage, nameStatus: "idle", nameSuggestions: [],
        nameHistory: s.name && !s.nameHistory.includes(s.name) ? [...s.nameHistory, s.name] : s.nameHistory
      });
    } else set({ stage });
  }
});
