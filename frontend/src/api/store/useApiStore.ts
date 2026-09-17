import { api, isMock } from "@/api/api";
import { AuthResponse, UserProfile } from "@/api/types";
import { create } from "zustand";

interface AuthState {
  user: UserProfile | null; token: string | null; coins: number; isAuthenticated: boolean; isLoading: boolean; error: string | null;
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
  executeAction: (actionType: "buy_medicine" | "mini_game_reward" | "buy_shop_items", total: number, difficulty?: "easy" | "medium" | "hard" | "memory" | boolean) => Promise<boolean>;
}

const getLocalCoins = (): number => typeof window === "undefined" ? 0 : Number(localStorage.getItem("local_user_coins") || "0");
const saveLocalCoins = (amount: number) => { if (typeof window !== "undefined") localStorage.setItem("local_user_coins", String(amount)); };
let lastActionTime = 0;

export const useApiStore = create<AuthState>((set, get) => {
  const handleAuth = (res: AuthResponse, isFlow: boolean = true) => {
    if (!res || !res.accessToken || !res.user) {
      throw new Error("Невалидный ответ авторизации от сервера");
    }
    localStorage.setItem("accessToken", res.accessToken);
    localStorage.setItem("refreshToken", res.refreshToken);
    const serverCoins = isMock ? (res.user?.coins || 5000) : (res.user && typeof res.user.coins === "number" ? res.user.coins : 0);
    saveLocalCoins(serverCoins);
    set({ user: res.user, token: res.accessToken, coins: serverCoins, isAuthenticated: true, isLoading: false });
    return res;
  };

  return {
    user: null, token: null, coins: getLocalCoins(), isAuthenticated: false, isLoading: false, error: null,
    clearError: () => set({ error: null }),
    checkName: async (name) => { set({ isLoading: true, error: null }); try { const res = await api.checkName(name); if (get().user) set({ user: { ...get().user!, name } }); set({ isLoading: false }); return res; } catch (err) { set({ isLoading: false, error: err instanceof Error ? err.message : "Ошибка" }); throw err; } },
    register: async (name, phone) => { set({ isLoading: true, error: null }); try { return handleAuth(await api.register({ name, phone }), false); } catch (err) { set({ isLoading: false, error: err instanceof Error ? err.message : "Ошибка" }); throw err; } },
    login: async (email, pass) => { set({ isLoading: true, error: null }); try { return handleAuth(await api.login(email, pass), true); } catch (err) { set({ isLoading: false, error: err instanceof Error ? err.message : "Ошибка" }); throw err; } },
    loginPhone: async (phone, chosenPetName) => { set({ isLoading: true, error: null }); try { const res = await api.loginPhone(phone, chosenPetName); set({ isLoading: false }); return res; } catch (err) { set({ isLoading: false, error: err instanceof Error ? err.message : "Ошибка" }); throw err; } },
    verifySms: async (phone, code) => { set({ isLoading: true, error: null }); try { const res = await api.verifySms(phone, code); set({ isLoading: false }); return res; } catch (err) { set({ isLoading: false, error: err instanceof Error ? err.message : "Ошибка" }); throw err; } },

    verifyFruit: async (sid, fcode, phone, isFlow) => {
      set({ isLoading: true, error: null });
      try {
        const res = await api.verifyFruit(sid, fcode, phone, isFlow);
        return handleAuth(res, true);
      } catch (err) {
        set({ isLoading: false, error: err instanceof Error ? err.message : "Ошибка капчи" });
        throw err;
      }
    },

    loginQr: async (qr) => { set({ isLoading: true, error: null }); try { return handleAuth(await api.loginQr(qr), true); } catch (err) { set({ isLoading: false, error: err instanceof Error ? err.message : "Ошибка" }); throw err; } },

    refreshToken: async () => {
      const rt = localStorage.getItem("refreshToken");
      if (!rt) { set({ isAuthenticated: false }); return false; }
      set({ isLoading: true, error: null });
      try {
        const res = await api.refresh(rt);
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        const serverCoins = isMock ? (res.user?.coins || 5000) : (res.user && typeof res.user.coins === "number" ? res.user.coins : 0);
        saveLocalCoins(serverCoins);
        set({ user: res.user, token: res.accessToken, coins: serverCoins, isAuthenticated: true, isLoading: false });
        return true;
      } catch {
        localStorage.removeItem("accessToken"); localStorage.removeItem("refreshToken");
        set({ isLoading: false, isAuthenticated: false, user: null, token: null, coins: 0 });
        return false;
      }
    },

    logout: async () => { set({ isLoading: true }); try { await api.logout(); } catch {} localStorage.removeItem("accessToken"); localStorage.removeItem("refreshToken"); localStorage.removeItem("mock_accessToken"); localStorage.removeItem("login_phone_buffer"); localStorage.removeItem("local_user_coins"); localStorage.removeItem("local_saved_username"); if (typeof api.resetMockMemory === "function") api.resetMockMemory(); set({ user: null, token: null, coins: 0, isAuthenticated: false, isLoading: false, error: null }); window.location.reload(); },

    fetchCoins: async () => {
      const uid = get().user?.id || 0;
      set({ isLoading: true, error: null });
      try {
        const res = await api.getCoins(uid);
        const cc = res?.coins ?? getLocalCoins();
        saveLocalCoins(cc);
        set({ coins: cc });
        if (get().user) set({ user: { ...get().user!, coins: cc } });
      } catch {
        set({ coins: getLocalCoins() });
      } finally {
        set({ isLoading: false });
      }
    },

    executeAction: async (actionType, total, difficulty) => {
      const now = Date.now();
      if (actionType === "mini_game_reward" && now - lastActionTime < 1500) return true;
      if (actionType === "mini_game_reward") lastActionTime = now;
      const uid = get().user?.id || 0;

      let nextCoins = get().coins;
      if (actionType === "mini_game_reward") {
        let earned = 0;
        if (typeof difficulty === "string") earned = difficulty === "memory" ? total : ((total === 999 || total >= 20) ? (difficulty === "hard" ? 2 : 1) : 2);
        else if (typeof difficulty === "boolean") earned = difficulty ? 1 : 2;
        else earned = total === 999 ? 1 : ((total >= 20) ? 10 : 3);
        nextCoins += earned;
      } else if (actionType === "buy_medicine") {
        nextCoins = Math.max(0, nextCoins - 30);
      } else if (actionType === "buy_shop_items" && total) {
        nextCoins = Math.max(0, nextCoins - total);
      }

      saveLocalCoins(nextCoins);
      set({ coins: nextCoins });
      if (get().user) set({ user: { ...get().user!, coins: nextCoins } });

      try {
        const res = await api.updateCoins(actionType, uid, total);
        const serverCoins = res && typeof res.coins === "number" ? res.coins : nextCoins;
        saveLocalCoins(serverCoins);
        set({ coins: serverCoins });
        if (get().user) set({ user: { ...get().user!, coins: serverCoins } });
        return true;
      } catch (err) {
        return isMock;
      }
    }
  };
});

if (typeof window !== "undefined" && !isMock) {
  const token = localStorage.getItem("accessToken");
  if (token) useApiStore.getState().refreshToken().then((sc) => { if (sc) useApiStore.getState().fetchCoins(); });
}
