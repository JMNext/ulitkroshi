import { create } from "zustand";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { checkNameValidity } from "../utils/profanityFilter";

export interface Step1State {
  stage: number;
  name: string;
  input: string;
  isNameChecking: boolean;
  nameStatus: "idle" | "available" | "profane" | "spaces" | "song";
  nameSuggestions: string[];
  nameHistory: string[];
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
  nameHistory: [] as string[]
};

const formatName = (s: string): string => {
  const trimmed = s.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : "Булька";
};

const cleanTextRegex = (text: string) => text.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s-]/g, "");

export const useRegistrationStep1Store = create<Step1State>((set, get) => {
  const triggerNameCheck = async (value: string): Promise<boolean> => {
    const trimmed = value.trim();
    if (!trimmed) return false;

    const validity = checkNameValidity(trimmed);
    if (validity === "spaces" || validity === "profane" || validity === "song") {
      set({ isNameChecking: false, nameStatus: validity, stage: 1, input: trimmed });
      return false;
    }

    usePetStore.getState().updateField("petName", trimmed);

    set({
      isNameChecking: false,
      nameStatus: "available",
      nameSuggestions: [],
      stage: 2,
      input: ""
    });
    return true;
  };

  const processAndSubmitName = async (targetText: string): Promise<void> => {
    const textToProcess = targetText.trim() || get().input.trim();

    if (!textToProcess) {
      set({ stage: 3, nameStatus: "idle", nameSuggestions: [] });
      return;
    }

    const formatted = formatName(cleanTextRegex(textToProcess));
    const currentStatus = get().nameStatus;

    if (formatted === get().name && (currentStatus === "profane" || currentStatus === "spaces" || currentStatus === "song")) {
      return;
    }

    set({ name: formatted });
    await triggerNameCheck(formatted);
  };

  return {
    ...initialValues,
    setInput: (val) => {
      set({ input: val, nameStatus: "idle", nameSuggestions: [] });
      if (get().stage === 3) set({ stage: 1 });
    },
    setStage: (stage) => {
      const currentStage = get().stage;
      if (stage === 1 && currentStage === 2) {
        const currentName = get().name;
        const history = get().nameHistory;
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
    submit: async (value) => {
      await processAndSubmitName(value);
    },
    setSpeechResult: async (text) => {
      const cleanSpeech = cleanTextRegex(text.trim());
      set({ input: cleanSpeech });
      await processAndSubmitName(cleanSpeech);
    },
    setSpeechError: async () => {
      await processAndSubmitName("");
    },
    resetStore: () => set(initialValues)
  };
});
