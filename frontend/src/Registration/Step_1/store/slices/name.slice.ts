import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { StateCreator } from "zustand";
import { checkNameValidity } from "../../utils/profanityFilter";
import { NameState, Step1StateCombined } from "../useRegistrationStep1Store";

const formatName = (s: string): string => {
  const trimmed = s.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : "Булька";
};

const cleanTextRegex = (text: string) => text.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s-]/g, "");

export const createNameSlice: StateCreator<Step1StateCombined, [], [], NameState> = (set, get) => {
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
    name: "",
    input: "",
    isNameChecking: false,
    nameStatus: "idle",
    nameSuggestions: [],

    setInput: (val) => {
      set({ input: val, nameStatus: "idle", nameSuggestions: [] });
      if (get().stage === 3) set({ stage: 1 });
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

    setSpeechError: () => processAndSubmitName("")
  };
};
