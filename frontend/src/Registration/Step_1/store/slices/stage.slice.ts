import { StateCreator } from "zustand";
import { StageState, Step1StateCombined } from "../useRegistrationStep1Store";

export const createStageSlice: StateCreator<Step1StateCombined, [], [], StageState> = (set, get) => ({
  stage: 1,
  nameHistory: [],
  layoutContext: null,
  finalScale: 1,

  setLayout: (layoutContext, finalScale) => set({ layoutContext, finalScale }),

  setStage: (stage) => {
    const state = get();
    if (stage === 1 && state.stage === 2) {
      const currentName = state.name;
      const history = state.nameHistory;
      set({
        stage,
        nameStatus: "idle",
        nameSuggestions: [],
        nameHistory: currentName && !history.includes(currentName) ? [...history, currentName] : history
      });
    } else {
      set({ stage });
    }
  }
});
