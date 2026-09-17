import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { create } from "zustand";
import { checkNameValidity } from "../utils/profanityFilter";

export interface LayoutContext {
  screenMode: "fold" | "mobile" | "tablet" | "desktop";
  viewW: number;
  scale: number;
  isVert: boolean;
}

export interface Step1State {
  stage: number;
  name: string;
  input: string;
  isNameChecking: boolean;
  nameStatus: "idle" | "available" | "profane" | "spaces" | "song";
  nameSuggestions: string[];
  nameHistory: string[];
  layoutContext: LayoutContext | null;
  finalScale: number;
  setLayout: (layoutContext: LayoutContext, finalScale: number) => void;
  setInput: (val: string) => void;
  setStage: (stage: number) => void;
  submit: (value: string) => void;
  setSpeechResult: (text: string) => void;
  setSpeechError: () => void;
  resetStore: () => void;
  selectSuggestion: (suggestion: string) => void;
}

const initialValues = {
  stage: 1,
  name: "",
  input: "",
  isNameChecking: false,
  nameStatus: "idle" as const,
  nameSuggestions: [] as string[],
  nameHistory: [] as string[],
  layoutContext: null,
  finalScale: 1
};

const formatName = (s: string): string => {
  const trimmed = s.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : "Булька";
};

const cleanTextRegex = (text: string) => text.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s-]/g, "");

export const useRegistrationStep1Store = create<Step1State>((set, get) => {
  // Убран async/await: внутренняя проверка выполняется синхронно
  const triggerNameCheck = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) return false;

    const validity = checkNameValidity(trimmed);
    if (validity === "spaces" || validity === "profane" || validity === "song") {
      set({ isNameChecking: false, nameStatus: validity, stage: 1, input: trimmed });
      return false;
    }

    usePetStore.getState().updateField("petName", trimmed);
    set({ isNameChecking: false, nameStatus: "available", nameSuggestions: [], stage: 2, input: "" });
    return true;
  };

  const processAndSubmitName = (targetText: string): void => {
    const textToProcess = targetText.trim() || get().input.trim();
    if (!textToProcess) {
      set({ stage: 3, nameStatus: "idle", nameSuggestions: [] });
      return;
    }

    const formatted = formatName(cleanTextRegex(textToProcess));
    const state = get();
    if (formatted === state.name && ["profane", "spaces", "song"].includes(state.nameStatus)) return;

    set({ name: formatted });
    triggerNameCheck(formatted);
  };

  return {
    ...initialValues,
    setLayout: (layoutContext, finalScale) => set({ layoutContext, finalScale }),

    setInput: (val) => {
      set({ input: val, nameStatus: "idle", nameSuggestions: [] });
      if (get().stage === 3) set({ stage: 1 });
    },

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
    },

    selectSuggestion: (suggestion) => {
      const formatted = formatName(suggestion);
      usePetStore.getState().updateField("petName", formatted);
      set({ input: "", name: formatted, nameStatus: "available", nameSuggestions: [], stage: 2 });
    },

    submit: (value) => processAndSubmitName(value),

    setSpeechResult: (text) => {
      const cleanSpeech = cleanTextRegex(text.trim());
      set({ input: cleanSpeech });
      processAndSubmitName(cleanSpeech);
    },

    setSpeechError: () => processAndSubmitName(""),

    resetStore: () => set(initialValues)
  };
});
