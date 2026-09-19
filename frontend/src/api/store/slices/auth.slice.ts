import { api, isMock } from "../../api";
import { StateCreator } from "zustand";
import { ApiStateCombined, AuthSliceState } from "../useApiStore";

export const createAuthSlice: StateCreator<ApiStateCombined, [], [], AuthSliceState> = (set, get) => {
  const handleAuth = (res: any) => {
    if (!res || !res.accessToken || !res.user) {
      throw new Error("Невалидный ответ авторизации от сервера");
    }
    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);

    const serverCoins = isMock ? 5000 : (typeof res.user.coins === "number" ? res.user.coins : 0);

    if (typeof window !== "undefined") localStorage.setItem("local_user_coins", String(serverCoins));
    set({ user: res.user, token: res.accessToken, coins: serverCoins, isAuthenticated: true, isLoading: false });
    return res;
  };

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    checkName: async (name: string) => {
      set({ isLoading: true, error: null });
      try {
        const currentUser = get().user;
        if (currentUser) set({ user: { ...currentUser, name } });
        set({ isLoading: false });
        return { available: true };
      } catch (err) {
        set({ isLoading: false, error: err instanceof Error ? err.message : "Ошибка" });
        throw err;
      }
    },

    loginPhone: async (phone: string, chosenPetName?: string) => {
      set({ isLoading: true, error: null });
      if (typeof window !== "undefined") {
        localStorage.removeItem("local_user_coins");
      }
      try {
        const res = await api.loginPhone(phone, chosenPetName);
        set({ isLoading: false, coins: 0 });
        return res;
      } catch (err) {
        set({ isLoading: false, error: err instanceof Error ? err.message : "Ошибка" });
        throw err;
      }
    },

    verifySms: async (phone: string, code: string) => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.verifySms(phone, code);
        set({ isLoading: false });
        return res;
      } catch (err) {
        set({ isLoading: false, error: err instanceof Error ? err.message : "Ошибка" });
        throw err;
      }
    },

    refreshToken: async () => {
      const rt = localStorage.getItem("refreshToken");
      if (!rt) {
        set({ isAuthenticated: false, isLoading: false, user: null, token: null });
        return false;
      }
      set({ isLoading: true, error: null });
      try {
        const res = await api.refresh(rt);
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        const serverCoins = isMock ? 5000 : (typeof res.user.coins === "number" ? res.user.coins : 0);
        if (typeof window !== "undefined") localStorage.setItem("local_user_coins", String(serverCoins));
        set({ user: res.user, token: res.accessToken, coins: serverCoins, isAuthenticated: true, isLoading: false });
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
      localStorage.removeItem("login_phone_buffer");
      localStorage.removeItem("local_user_coins");
      localStorage.removeItem("local_saved_username");
      if (typeof api.resetMockMemory === "function") api.resetMockMemory();
      set({ user: null, token: null, coins: 0, isAuthenticated: false, isLoading: false, error: null });
      window.location.reload();
    }
  };
};
