import { create } from "zustand";
import { UserProfile, AuthResponse } from "../types/types";
import { createAuthSlice } from "./slices/auth.slice";
import { createWalletSlice } from "./slices/wallet.slice";
import { authApi } from "@/api/services/auth.api";

export interface AuthSliceState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  loginPhone: (phone: string, chosenPetName?: string) => Promise<{ success: boolean; sessionId: string; isLogin: boolean }>;
  verifySms: (phone: string, code: string) => Promise<{ sessionId: string }>;
  loginFruit: (fruits: string, phone: string) => Promise<AuthResponse>;
  verifyFruit: (sessionId: string, fruits: string, phone: string, petName: string) => Promise<AuthResponse>;
  refreshToken: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export interface WalletSliceState {
  coins: number;
  fetchCoins: () => Promise<void>;
  executeAction: (
    actionType: "buy_medicine" | "mini_game_reward" | "buy_shop_items",
    total: number,
    difficulty?: "easy" | "medium" | "hard" | "memory" | boolean
  ) => Promise<boolean>;
}

export interface ApiStateCombined extends AuthSliceState, WalletSliceState {
  restoreSession: () => Promise<UserProfile | null>;
}

export const useApiStore = create<ApiStateCombined>()((set, get, ...a) => ({
  ...createAuthSlice(set, get, ...a),
  ...createWalletSlice(set, get, ...a),

  restoreSession: async () => {
    try {
      const u = await authApi.restore();
      if (!u) return null;

      const coinsVal = typeof u.coins === "number" ? u.coins : 0;
      set({ user: u, coins: coinsVal, isAuthenticated: true });

      return u;
    } catch {
      return null;
    }
  }
}));
