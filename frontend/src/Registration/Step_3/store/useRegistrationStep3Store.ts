import { create } from "zustand";
import { createFruitLoginSlice } from "./slices/fruitLogin.slice";
import { createFruitRegisterSlice } from "./slices/fruitRegister.slice";

export type CaptchaMode = "select" | "confirm" | "verify" | "error";
export interface LayoutContext { screenMode: "fold" | "mobile" | "tablet" | "desktop"; viewW: number; scale: number; isVert: boolean; }

export interface LoginState {
  loginSel: number[]; loginMode: CaptchaMode; loginShake: boolean; loginAttempts: number; loginError: "wrong_fruit" | "system_error" | ""; isLoginSubmitting: boolean;
  toggleLoginSelect: (id: number, sessionId: string, onComplete: () => void) => Promise<void>;
}

export interface RegisterState {
  registerSel: number[]; registerCorr: number[]; step3Mode: CaptchaMode; registerShake: boolean; registerAttempts: number; step3Error: "wrong_fruit" | "server_error" | ""; isRegisterSubmitting: boolean;
  saveFirstStep: () => void; toggleRegisterSelect: (id: number, sessionId: string, onComplete: () => void) => Promise<void>;
}

export interface Step3CombinedState extends LoginState, RegisterState {
  isLogin: boolean; fruitOrder: number[]; layoutContext: LayoutContext | null; computedScale: number;
  generateNewOrder: () => void; setIsLogin: (isLogin: boolean) => void; setLayout: (ctx: LayoutContext, cs: number) => void; resetStore: (keep?: boolean, success?: boolean) => void;
}

const genOrder = (): number[] => Array.from({ length: 16 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
let shakeId: any = null, clearId: any = null;

export const setShakeTimeoutId = (id: any) => { shakeId = id; };
export const setClearFruitsTimeoutId = (id: any) => { clearId = id; };
export const clearTimers = () => { if (shakeId) clearTimeout(shakeId); if (clearId) clearTimeout(clearId); shakeId = clearId = null; };

const initial = { loginSel: [], loginMode: "select" as const, loginShake: false, loginAttempts: 0, loginError: "" as const, isLoginSubmitting: false, registerSel: [], registerCorr: [], step3Mode: "select" as const, registerShake: false, registerAttempts: 0, step3Error: "" as const, isRegisterSubmitting: false };

export const useRegistrationStep3Store = create<Step3CombinedState>()((set, get, ...a) => ({
  ...initial, isLogin: false, fruitOrder: genOrder(), layoutContext: null, computedScale: 1,

  ...createFruitLoginSlice(set, get, ...a),
  ...createFruitRegisterSlice(set, get, ...a),

  setLayout: (layoutContext, computedScale) => set({ layoutContext, computedScale }),
  setIsLogin: (isLogin) => set((s) => ({ ...s, isLogin, loginMode: "select", step3Mode: "select" })),
  generateNewOrder: () => set({ fruitOrder: genOrder() }),

  resetStore: (keep = false, success = false) => {
    clearTimers();
    if (get().isLogin) set({ loginSel: [], loginShake: false, loginError: "", loginMode: "select", isLoginSubmitting: false });
    else if (success) set((s) => ({ ...s, ...initial, isLogin: keep ? s.isLogin : false }));
    else set({ registerSel: [], registerShake: false, step3Error: "", step3Mode: "select", isRegisterSubmitting: false });
  }
}));
