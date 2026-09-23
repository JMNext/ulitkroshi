import { create } from "zustand";

interface LoginState {
  status: "button" | "loading"; progress: number; width: number; height: number; scale: number; isVert: boolean;
  updateField: <K extends keyof LoginState>(field: K, value: LoginState[K]) => void;
  startLoading: (onComplete: () => void) => void; resetStore: () => void;
}

const initial = { status: "button" as const, progress: 0, width: 0, height: 0, scale: 1, isVert: true };
let animId: any = null, timeId: any = null;

const clear = () => { if (animId) cancelAnimationFrame(animId); if (timeId) clearTimeout(timeId); animId = timeId = null; };

export const useLoginStore = create<LoginState>((set) => ({
  ...initial,

  updateField: (f, v) => set((s) => ({ ...s, [f]: v })),

  startLoading: (onComplete) => {
    clear(); set({ status: "loading", progress: 0 });
    const start = performance.now();

    const frame = (now: number) => {
      const p = Math.min((now - start) / 1500, 1);
      set({ progress: p });
      p < 1 ? animId = requestAnimationFrame(frame) : (animId = null, timeId = setTimeout(() => { timeId = null; onComplete(); }, 50));
    };
    animId = requestAnimationFrame(frame);
  },

  resetStore: () => { clear(); set(initial); }
}));
