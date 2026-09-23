import { EventBus } from "@/eventbus/EventBus";
import Phaser from "phaser";
import { create } from "zustand";
import { createPhoneLoginSlice } from "./slices/phoneLogin.slice";
import { createPhoneRegisterSlice } from "./slices/phoneRegister.slice";

export interface LayoutContext { screenMode: "fold" | "mobile" | "tablet" | "desktop"; viewW: number; scale: number; isVert: boolean; }
export interface CustomWindow extends Window { phaserGame: Phaser.Game | null; }

export interface LoginState {
  loginPhone: string; loginRawPhone: string; loginError: "system_error" | "user_not_found" | "";
  sendLoginPhone: () => Promise<void>; handleLoginKeyboard: (key: string) => void;
}

export interface RegisterState {
  registerPhone: string; registerCode: string; registerMode: "phone" | "sent" | "code" | "exists"; registerSecs: number; registerRawPhone: string; registerAttempts: number;
  registerError: "system_error" | "expired" | "too_many_attempts" | "wrong_code" | ""; isVerifyingCode: boolean;
  setRegisterMode: (mode: "phone" | "sent" | "code" | "exists") => void; sendRegisterPhone: () => Promise<void>; confirmRegisterSent: () => void;
  startRegisterTimer: () => void; handleRegisterKeyboard: (key: string) => void; verifyRegisterSms: (onSuccess: (sessionId: string) => void) => Promise<void>;
}

export interface Step2CombinedState extends LoginState, RegisterState {
  isLogin: boolean; layoutContext: LayoutContext | null; computedScale: number; phaserScene: Phaser.Scene | null;
  setPhaserScene: (scene: Phaser.Scene) => void; setIsLogin: (isLogin: boolean) => void; clearErrors: () => void;
  checkSavedDevicePhone: (onSuccess: () => void) => void; setLayout: (ctx: LayoutContext, cs: number) => void; resetStore: () => void; cancelToMainMenu: () => void;
}

let activeTimerId: any = null, mvpPollingId: any = null, savedSessionId: string | null = null;

export const getActiveTimerId = () => activeTimerId;
export const setActiveTimerId = (id: any) => { activeTimerId = id; };
export const getMvpPollingId = () => mvpPollingId;
export const setMvpPollingId = (id: any) => { mvpPollingId = id; };
export const getSavedSessionId = () => savedSessionId;
export const setSavedSessionId = (id: string | null) => { savedSessionId = id; };

export const clearTimers = () => {
  if (activeTimerId) clearInterval(activeTimerId);
  if (mvpPollingId) clearTimeout(mvpPollingId);
  activeTimerId = mvpPollingId = null; savedSessionId = null;
};

export const useRegistrationStep2Store = create<Step2CombinedState>()((set, get, ...a) => ({
  isLogin: false, layoutContext: null, computedScale: 1, phaserScene: null,

  ...createPhoneLoginSlice(set, get, ...a),
  ...createPhoneRegisterSlice(set, get, ...a),

  setPhaserScene: (phaserScene) => set({ phaserScene }),
  setIsLogin: (isLogin) => set({
    isLogin, loginPhone: "", loginRawPhone: "", loginError: "", registerPhone: "", registerRawPhone: "", registerCode: "", registerError: "", registerMode: "phone"
  }),
  clearErrors: () => set({ loginError: "", registerError: "" }),
  setLayout: (layoutContext, computedScale) => set({ layoutContext, computedScale }),

  checkSavedDevicePhone: (onSuccess) => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("saved_user_phone") : null;
    if (saved?.trim()) { localStorage.setItem("login_phone_buffer", saved.trim()); onSuccess(); }
  },

  resetStore: () => {
    clearTimers();
    set({ loginPhone: "", loginRawPhone: "", loginError: "", registerPhone: "", registerCode: "", registerRawPhone: "", registerAttempts: 0, registerError: "", registerMode: "phone", registerSecs: 60, isVerifyingCode: false, layoutContext: null, computedScale: 1, phaserScene: null });
  },

  cancelToMainMenu: () => {
    clearTimers(); get().resetStore();
    EventBus.emit("step2_scene_stop"); EventBus.emit("login_scene_start");
    const game = typeof window !== "undefined" ? (window as any).phaserGame : null;
    if (game) { game.scene.stop("Step2Scene"); game.scene.start("LoginScene"); }
  }
}));
