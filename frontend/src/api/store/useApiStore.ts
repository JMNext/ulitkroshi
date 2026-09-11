import { api, isMock } from "@/api/api";
import { AuthResponse, UserProfile } from "@/api/types";
import { create } from "zustand";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  coins: number;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  checkName: (name: string) => Promise<{ available: boolean; suggestions?: string[] }>;
  register: (name: string, phone: string) => Promise<AuthResponse>;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  loginPhone: (phone: string, chosenPetName?: string) => Promise<{ success: boolean; sessionId: string; isLogin: boolean }>;
  verifySms: (phone: string, code: string) => Promise<{ sessionId: string }>;
  verifyFruit: (sessionId: string, fruitCode: string, phone?: string, isLoginFlow?: boolean) => Promise<AuthResponse>;
  loginQr: (qrData: string) => Promise<AuthResponse>;
  refreshToken: () => Promise<boolean>;
  logout: () => Promise<void>;
  fetchCoins: () => Promise<void>;
  executeAction: (actionType: "buy_medicine" | "mini_game_reward" | "buy_shop_items", total?: number) => Promise<boolean>;
}

const getErrorMessage = (err: unknown, defaultMsg: string): string => (err instanceof Error ? err.message : defaultMsg);

export const useApiStore = create<AuthState>((set, get) => {
  const handleAuthSuccess = (res: AuthResponse) => {
    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);

    let serverCoins = res.user?.coins ?? 0;
    if (serverCoins === 100) {
      serverCoins = 0;
    }

    set({
      user: { ...res.user, coins: serverCoins },
      token: res.accessToken,
      coins: serverCoins,
      isAuthenticated: true,
      isLoading: false
    });
    return res;
  };

  return {
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
        const res = await api.checkName(name);
        if (get().user) set({ user: { ...get().user!, name } });
        set({ isLoading: false });
        return res;
      } catch (err) {
        set({ isLoading: false, error: getErrorMessage(err, "Ошибка проверки имени") });
        throw err;
      }
    },

    register: async (name, phone) => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.register({ name, phone });
        return handleAuthSuccess(res);
      } catch (err) {
        set({ isLoading: false, error: getErrorMessage(err, "Ошибка регистрации") });
        throw err;
      }
    },

    login: async (email, pass) => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.login(email, pass);
        return handleAuthSuccess(res);
      } catch (err) {
        set({ isLoading: false, error: getErrorMessage(err, "Ошибка входа") });
        throw err;
      }
    },

    loginPhone: async (phone, chosenPetName) => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.loginPhone(phone, chosenPetName);
        set({ isLoading: false });
        return res;
      } catch (err) {
        set({ isLoading: false, error: getErrorMessage(err, "Ошибка отправки SMS") });
        throw err;
      }
    },

    verifySms: async (phone, code) => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.verifySms(phone, code);
        set({ isLoading: false });
        return res;
      } catch (err) {
        set({ isLoading: false, error: getErrorMessage(err, "Неверный код SMS") });
        throw err;
      }
    },

    verifyFruit: async (sessionId, fruitCode, phone, isLoginFlow) => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.verifyFruit(sessionId, fruitCode, phone, isLoginFlow);
        return handleAuthSuccess(res);
      } catch (err) {
        set({ isLoading: false, error: getErrorMessage(err, "Неверный фруктовый код") });
        throw err;
      }
    },

    loginQr: async (qrData) => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.loginQr(qrData);
        return handleAuthSuccess(res);
      } catch (err) {
        set({ isLoading: false, error: getErrorMessage(err, "Ошибка QR-кода") });
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
        const res = await api.refresh(currentRefreshToken);
        handleAuthSuccess(res);
        return true;
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ isLoading: false, isAuthenticated: false, user: null, token: null, coins: 0 });
        return false;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        await api.logout();
      } catch {}
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
        const res = await api.getCoins(userId);
        let backendCoins = res.coins ?? 0;

        if (backendCoins === 100) {
          backendCoins = 0;
        }

        set({ coins: backendCoins, isLoading: false });
      } catch (err) {
        set({ isLoading: false, error: getErrorMessage(err, "Ошибка получения монет") });
      }
    },

    executeAction: async (actionType, total) => {
      const userId = get().user?.id;
      if (!userId) return false;
      set({ isLoading: true, error: null });
      try {
        const res = await api.updateCoins(actionType, userId, total);
        set({ coins: res.coins, isLoading: false });
        return true;
      } catch (err) {
        set({ isLoading: false, error: getErrorMessage(err, "Ошибка выполнения операции") });
        return false;
      }
    }
  };
});

if (typeof window !== "undefined") {
  if (isMock) {
    const hasMockToken = localStorage.getItem("mock_accessToken");
    if (hasMockToken) {
      api.restore().then((mockUser: UserProfile) => {
        useApiStore.setState({ user: mockUser, token: "mock_token_active", coins: mockUser.coins, isAuthenticated: true });
      });
    } else {
      useApiStore.setState({ isAuthenticated: false });
    }
  } else {
    const token = localStorage.getItem("accessToken");
    if (token) {
      useApiStore
        .getState()
        .refreshToken()
        .then((success) => {
          if (success) useApiStore.getState().fetchCoins();
        });
    }
  }
}
