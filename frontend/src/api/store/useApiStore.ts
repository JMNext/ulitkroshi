import { create } from "zustand";
import { AuthResponse, UserProfile } from "../types/types";
import { createAuthSlice } from "./slices/auth.slice";
import { createWalletSlice } from "./slices/wallet.slice";
import { isMock } from "@/api/client";

export interface AuthSliceState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  checkName: (name: string) => Promise<{ available: boolean; suggestions?: string[] }>;
  loginPhone: (phone: string, chosenPetName?: string) => Promise<{ success: boolean; sessionId: string; isLogin: boolean }>;
  verifySms: (phone: string, code: string) => Promise<{ sessionId: string }>;
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

export interface ApiStateCombined extends AuthSliceState, WalletSliceState {}

export const useApiStore = create<ApiStateCombined>()((set, get, ...a) => {
  const baseStore = {
    ...createAuthSlice(set, get, ...a),
    ...createWalletSlice(set, get, ...a)
  };

  return {
    ...baseStore,
    set: (state: any) => {
      if (state.user && typeof window !== "undefined") {
        const localName = localStorage.getItem("local_saved_username");
        if (localName && localName.trim()) {
          state.user.name = localName.trim();
        }
      }
      set(state);
    }
  };
});

useApiStore.subscribe((state) => {
  if (state.user && typeof window !== "undefined") {
    const localName = localStorage.getItem("local_saved_username");
    if (localName && localName.trim() && state.user.name !== localName.trim()) {
      state.user.name = localName.trim();
    }
  }
});

if (typeof window !== "undefined") {
  if (isMock) {
    useApiStore.setState({ coins: 5000 });
  } else {
    useApiStore.setState({ coins: 0 });
  }
}
