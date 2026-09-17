import { create } from "zustand";

export interface LayoutContext {
  screenMode: "fold" | "mobile" | "tablet" | "desktop";
  viewW: number;
  scale: number;
  isVert: boolean;
}

interface Step4State {
  layoutContext: LayoutContext | null;
  finalScale: number;
  setLayout: (layoutContext: LayoutContext, finalScale: number) => void;
  resetStore: () => void;
}

const initialValues = {
  layoutContext: null,
  finalScale: 1
} as const;

export const useRegistrationStep4Store = create<Step4State>((set) => ({
  ...initialValues,
  setLayout: (layoutContext, finalScale) => set({ layoutContext, finalScale }),
  resetStore: () => set(initialValues)
}));
