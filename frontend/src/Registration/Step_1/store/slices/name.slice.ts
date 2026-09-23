import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { StateCreator } from "zustand";
import { checkNameValidity } from "../../utils/profanityFilter";
import { NameState, Step1StateCombined } from "../useRegistrationStep1Store";

const fmt = (s: string) => s.trim() ? s.trim().charAt(0).toUpperCase() + s.trim().slice(1) : "";
const clean = (t: string) => t.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s-]/g, "");

export const createNameSlice: StateCreator<Step1StateCombined, [], [], NameState> = (set, get) => {
  const submitName = (target: string) => {
    const val = target.trim() || get().input.trim();
    if (!val) return set({ stage: 3, nameStatus: "idle", nameSuggestions: [] });

    const formatted = fmt(clean(val)), s = get();
    if (formatted === s.name && ["profane", "spaces", "song"].includes(s.nameStatus)) return;
    set({ name: formatted });

    if (!formatted.trim()) return;
    const res = checkNameValidity(formatted.trim());
    if (["spaces", "profane", "song"].includes(res)) {
      return set({ isNameChecking: false, nameStatus: res as any, stage: 1, input: formatted.trim() });
    }

    usePetStore.getState().updateField("petName", formatted.trim());
    set({ isNameChecking: false, nameStatus: "available", nameSuggestions: [], stage: 2, input: "" });
  };

  return {
    name: "", input: "", isNameChecking: false, nameStatus: "idle", nameSuggestions: [],

    setInput: (val) => {
      set({ input: val, nameStatus: "idle", nameSuggestions: [] });
      if (get().stage === 3) set({ stage: 1 });
    },

    selectSuggestion: (sug) => {
      const formatted = fmt(sug);
      usePetStore.getState().updateField("petName", formatted);
      set({ input: "", name: formatted, nameStatus: "available", nameSuggestions: [], stage: 2 });
    },

    submit: (value) => submitName(value),
    setSpeechResult: (text) => { const str = clean(text.trim()); set({ input: str }); submitName(str); },
    setSpeechError: () => submitName("")
  };
};
