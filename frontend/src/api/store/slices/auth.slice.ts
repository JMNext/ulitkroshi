import { StateCreator } from "zustand";
import { authApi } from "../../auth.api";
import { isMock } from "../../client";
import { ApiStateCombined, AuthSliceState } from "../useApiStore";

export const createAuthSlice: StateCreator<ApiStateCombined, [], [], AuthSliceState> = (set, get) => {
  const saveAuth = (res: any) => {
    if (!res?.accessToken || !res?.user) throw new Error("Невалидный ответ");
    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);

    const coins = isMock ? 5000 : typeof res.user.coins === "number" ? res.user.coins : 0;
    localStorage.setItem("local_user_coins", String(coins));

    const name = localStorage.getItem("local_saved_username")?.trim();
    if (name) res.user.name = name;

    set({ user: res.user, token: res.accessToken, coins, isAuthenticated: true, isLoading: false });
    return res;
  };

  const fail = (err: any) => { set({ isLoading: false, error: err instanceof Error ? err.message : "Ошибка" }); throw err; };

  return {
    user: null, token: null, isAuthenticated: false, isLoading: false, error: null,

    clearError: () => set({ error: null }),

    checkName: async (name: string) => {
      set({ isLoading: true, error: null });
      try {
        const clean = name.trim();
        if (clean) localStorage.setItem("local_saved_username", clean);
        if (get().user) set({ user: { ...get().user!, name: clean } });
        set({ isLoading: false });
        return { available: true };
      } catch (err) { return fail(err); }
    },

    loginPhone: async (phone: string, chosenPetName?: string) => {
      set({ isLoading: true, error: null });
      localStorage.removeItem("local_user_coins");
      try { const res = await authApi.loginPhone(phone, chosenPetName); set({ isLoading: false, coins: 0 }); return res; }
      catch (err) { return fail(err); }
    },

    verifySms: async (phone: string, code: string) => {
      set({ isLoading: true, error: null });
      try { const res = await authApi.verifySms(phone, code); set({ isLoading: false }); return res; }
      catch (err) { return fail(err); }
    },

    refreshToken: async () => {
      const rt = localStorage.getItem("refreshToken");
      if (!rt) { set({ isAuthenticated: false, isLoading: false, user: null, token: null }); return false; }
      set({ isLoading: true, error: null });
      try { return !!saveAuth(await authApi.refresh(rt)); }
      catch {
        localStorage.removeItem("accessToken"); localStorage.removeItem("refreshToken");
        set({ isLoading: false, isAuthenticated: false, user: null, token: null, coins: 0 });
        return false;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try { await authApi.logout(); } catch {}
      ["accessToken", "refreshToken", "mock_accessToken", "login_phone_buffer", "local_user_coins", "local_saved_username"].forEach(k => localStorage.removeItem(k));
      if (typeof authApi.resetMockMemory === "function") authApi.resetMockMemory();
      set({ user: null, token: null, coins: 0, isAuthenticated: false, isLoading: false, error: null });
      window.location.reload();
    }
  };
};
