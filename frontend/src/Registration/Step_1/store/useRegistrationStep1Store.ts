import { create } from "zustand";
import { createNameSlice } from "./slices/name.slice";
import { createStageSlice } from "./slices/stage.slice";

export interface LayoutContext {
  screenMode: "fold" | "mobile" | "tablet" | "desktop";
  viewW: number;
  scale: number;
  isVert: boolean;
}

export interface NameState {
  name: string;
  input: string;
  isNameChecking: boolean;
  nameStatus: "idle" | "available" | "profane" | "spaces" | "song";
  nameSuggestions: string[];
  setInput: (val: string) => void;
  submit: (value: string) => void;
  setSpeechResult: (text: string) => void;
  setSpeechError: () => void;
  selectSuggestion: (suggestion: string) => void;
}

export interface StageState {
  stage: number;
  nameHistory: string[];
  layoutContext: LayoutContext | null;
  finalScale: number;
  setLayout: (layoutContext: LayoutContext, finalScale: number) => void;
  setStage: (stage: number) => void;
}

export interface Step1StateCombined extends NameState, StageState {
  resetStore: () => void;
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

export const useRegistrationStep1Store = create<Step1StateCombined>()((set, get, ...a) => ({
  ...createNameSlice(set, get, ...a),
  ...createStageSlice(set, get, ...a),

  resetStore: () => set(initialValues)
}));
