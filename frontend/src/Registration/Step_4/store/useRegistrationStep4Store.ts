import { create } from "zustand";

export interface LayoutContext { screenMode: "fold" | "mobile" | "tablet" | "desktop"; viewW: number; scale: number; isVert: boolean; }

interface Step4State {
  layoutContext: LayoutContext | null; finalScale: number;
  setLayout: (ctx: LayoutContext, fs: number) => void; resetStore: () => void;
}

const initial = { layoutContext: null, finalScale: 1 };

export const useRegistrationStep4Store = create<Step4State>((set) => ({
  ...initial,
  setLayout: (layoutContext, finalScale) => set({ layoutContext, finalScale }),
  resetStore: () => set(initial)
}));
