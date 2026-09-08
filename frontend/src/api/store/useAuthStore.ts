import { create } from "zustand";
import { authApi, isMock } from "@/api/authApi";
import { UserProfile } from "@/api/types";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  coins: number; 
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  checkName: (name: string) => Promise<{ available: boolean; suggestions?: string[] }>;
  register: (name: string, phone: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  loginPhone: (phone: string, chosenPetName?: string) => Promise<void>;
  verifySms: (phone: string, code: string) => Promise<{ sessionId: string }>;
  verifyFruit: (sessionId: string, fruits: string[]) => Promise<void>;
  loginQr: (qrData: string) => Promise<void>;
  refreshToken: () => Promise<boolean>;
  logout: () => Promise<void>;
  fetchCoins: () => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  spendCoins: (amount: number) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  coins: 0, 
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  checkName: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.checkName(name);
      if (get().user) set({ user: { ...get().user!, name } });
      set({ isLoading: false });
      return res;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Ошибка проверки имени" });
      throw err;
    }
  },

  register: async (name, phone) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register({ name, phone });
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      set({ user: res.user, token: res.accessToken, coins: res.user.coins, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Ошибка регистрации" });
      throw err;
    }
  },

  login: async (email, pass) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(email, pass);
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      set({ user: res.user, token: res.accessToken, coins: res.user.coins, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Ошибка входа" });
      throw err;
    }
  },

  loginPhone: async (phone, chosenPetName) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.loginPhone(phone, chosenPetName);
      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Ошибка отправки SMS" });
      throw err;
    }
  },

  verifySms: async (phone, code) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.verifySms(phone, code);
      set({ isLoading: false });
      return res;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Неверный код SMS" });
      throw err;
    }
  },

  verifyFruit: async (sessionId, fruits) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.verifyFruit(sessionId, fruits);
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      set({ user: res.user, token: res.accessToken, coins: res.user.coins, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Неверный фруктовый код" });
      throw err;
    }
  },

  loginQr: async (qrData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.loginQr(qrData);
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      set({ user: res.user, token: res.accessToken, coins: res.user.coins, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Ошибка QR-кода" });
      throw err;
    }
  },

  refreshToken: async () => {
    const currentRefreshToken = localStorage.getItem("refreshToken");
    if (!currentRefreshToken) {
      set({ isAuthenticated: false });
      return false;
    }
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.refresh(currentRefreshToken);
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      set({ token: res.accessToken, user: res.user, coins: res.user.coins, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ isLoading: false, isAuthenticated: false, user: null, token: null, coins: 0 });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try { await authApi.logout(); } catch (err) {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("mock_accessToken");
    set({ user: null, token: null, coins: 0, isAuthenticated: false, isLoading: false, error: null });
  },

  fetchCoins: async () => {
    const userId = get().user?.id;
    if (!userId) return;
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.getCoins(userId);
      set({ coins: res.coins, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Ошибка получения монет" });
    }
  },

  addCoins: async (amount) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.updateCoins(amount);
      set({ coins: res.coins, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Ошибка пополнения" });
    }
  },

  spendCoins: async (amount) => {
    set({ isLoading: true, error: null });
    try {
      if (get().coins < amount) { set({ isLoading: false, error: "Недостаточно монет" }); return false; }
      const res = await authApi.updateCoins(-amount);
      set({ coins: res.coins, isLoading: false });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Ошибка списания" });
      return false;
    }
  }
}));

if (typeof window !== "undefined") {
  if (isMock) {
    const hasMockToken = localStorage.getItem("mock_accessToken");
    if (hasMockToken) {
      authApi.restore().then((mockUser) => {
        useAuthStore.setState({ user: mockUser, token: "mock_token_active", coins: mockUser.coins, isAuthenticated: true });
      });
    } else {
      useAuthStore.setState({ isAuthenticated: false });
    }
  } else {
    const token = localStorage.getItem("accessToken");
    if (token) {
      useAuthStore.getState().refreshToken().then((success) => {
        if (success) useAuthStore.getState().fetchCoins();
      });
    }
  }
}
