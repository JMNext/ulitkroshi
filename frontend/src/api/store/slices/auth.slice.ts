import { authApi } from "@/api/services/auth.api";
import { StateCreator } from "zustand";
import { AuthResponse } from "../../types/types";
import { ApiStateCombined, AuthSliceState } from "../useApiStore";

export interface ExtendedAuthSliceState extends AuthSliceState {
  loginFruit: (fruits: string, phone: string) => Promise<AuthResponse>;
  verifyFruit: (sessionId: string, fruits: string, phone: string, petName: string) => Promise<AuthResponse>;
}

export const createAuthSlice: StateCreator<ApiStateCombined, [], [], ExtendedAuthSliceState> = (set, get) => {
  const isClient = typeof window !== "undefined";

  const saveAuth = (res: any): AuthResponse => {
    const target = res?.data && res?.accessToken ? res : res?.data || res;

    if (!target?.accessToken || !target?.user) {
      throw new Error("Невалидный ответ сервера");
    }

    if (isClient) {
      localStorage.setItem("accessToken", target.accessToken);
      localStorage.setItem("refreshToken", target.refreshToken);
      const coins = typeof target.user.coins === "number" ? target.user.coins : 0;
      localStorage.setItem("local_user_coins", String(coins));
    }

    const coins = typeof target.user.coins === "number" ? target.user.coins : 0;
    set({ user: target.user, token: target.accessToken, coins, isAuthenticated: true, isLoading: false });
    return target as AuthResponse;
  };

  const fail = (err: unknown): never => {
    const errorObject = err instanceof Error ? err : new Error("Неизвестная ошибка выполнения");
    set({ isLoading: false, error: errorObject.message });
    throw errorObject;
  };

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    loginPhone: async (phone, chosenPetName) => {
      set({ isLoading: true, error: null });
      if (isClient) {
        localStorage.removeItem("login_phone_buffer");
      }
      try {
        const res = await authApi.loginPhone(phone, chosenPetName);
        set({ isLoading: false });
        return res;
      } catch (err) {
        return fail(err);
      }
    },

    verifySms: async (phone, code) => {
      set({ isLoading: true, error: null });
      try {
        const res = await authApi.verifySms(phone, code);
        if (res) {
          saveAuth(res);
        } else {
          set({ isLoading: false });
        }
        return res;
      } catch (err) {
        return fail(err);
      }
    },

    loginFruit: async (fruits, phone) => {
      set({ isLoading: true, error: null });
      try {
        const res = await authApi.loginFruit(fruits, phone);
        saveAuth(res);
        return res;
      } catch (err) {
        return fail(err);
      }
    },

    verifyFruit: async (sessionId, fruits, phone, petName) => {
      set({ isLoading: true, error: null });
      try {
        const res = await authApi.verifyFruit(sessionId, fruits, phone, petName);
        saveAuth(res);
        return res;
      } catch (err) {
        return fail(err);
      }
    },

    refreshToken: async () => {
      if (!isClient) return false;

      const rt = localStorage.getItem("refreshToken");
      if (!rt) {
        set({ isAuthenticated: false, isLoading: false, user: null, token: null });
        return false;
      }
      set({ isLoading: true, error: null });
      try {
        const data = await authApi.refresh(rt);
        if (!data) throw new Error();
        return !!saveAuth(data);
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
        await authApi.logout();
      } catch {}

      if (isClient) {
        const keys = [
          "accessToken",
          "refreshToken",
          "login_phone_buffer",
          "local_user_coins",
          "saved_user_phone",
          "active_reg_session_id",
          "is_login_flow"
        ];
        for (let i = 0; i < keys.length; i++) {
          localStorage.removeItem(keys[i]);
        }
      }

      set({ user: null, token: null, coins: 0, isAuthenticated: false, isLoading: false, error: null });
    }
  };
};
