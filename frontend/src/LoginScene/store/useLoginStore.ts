import { create } from "zustand";

interface LoginState {
  status: "button" | "loading";
  progress: number;
  width: number;
  height: number;
  scale: number;
  isVert: boolean;
  updateField: <K extends keyof LoginState>(field: K, value: LoginState[K]) => void;
  startLoading: (onCompleteAction: () => void) => void;
  resetStore: () => void;
}

const initialValues = {
  status: "button" as const,
  progress: 0,
  width: 0,
  height: 0,
  scale: 1,
  isVert: true
};

let activeAnimationFrameId: number | null = null;
let activeTimeoutId: any = null;

const clearActiveTimers = () => {
  if (activeAnimationFrameId) {
    cancelAnimationFrame(activeAnimationFrameId);
    activeAnimationFrameId = null;
  }
  if (activeTimeoutId) {
    clearTimeout(activeTimeoutId);
    activeTimeoutId = null;
  }
};

export const useLoginStore = create<LoginState>((set) => ({
  ...initialValues,

  updateField: (field, value) => set((state) => ({ ...state, [field]: value })),

  startLoading: (onCompleteAction) => {
    clearActiveTimers();
    set({ status: "loading", progress: 0 });
    const startTime = performance.now();

    const animate = (now: number) => {
      const nextProgress = Math.min((now - startTime) / 1500, 1);
      set({ progress: nextProgress });

      if (nextProgress < 1) {
        activeAnimationFrameId = requestAnimationFrame(animate);
      } else {
        activeAnimationFrameId = null;
        activeTimeoutId = setTimeout(() => {
          activeTimeoutId = null;
          onCompleteAction();
        }, 50);
      }
    };
    activeAnimationFrameId = requestAnimationFrame(animate);
  },

  resetStore: () => {
    clearActiveTimers();
    set(initialValues);
  }
}));
