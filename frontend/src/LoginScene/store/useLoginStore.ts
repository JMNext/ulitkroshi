import { create } from 'zustand';

interface LoginState {
  status: 'button' | 'loading';
  progress: number;
  startLoading: (onCompleteAction: () => void) => void;
  resetStore: () => void;
}

const initialValues = {
  status: 'button' as const,
  progress: 0,
};

let activeAnimationFrameId: number | null = null;
let activeTimeoutId: ReturnType<typeof setTimeout> | null = null;

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

  startLoading: (onCompleteAction) => {
    clearActiveTimers();

    set({ status: 'loading', progress: 0 });
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
