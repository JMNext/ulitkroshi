import { isMock } from "@/api/client";
import { create } from "zustand";
import { UserProfile } from "../types/types";
import { createAuthSlice } from "./slices/auth.slice";
import { createWalletSlice } from "./slices/wallet.slice";

export interface AuthSliceState {
  user: UserProfile | null; token: string | null; isAuthenticated: boolean; isLoading: boolean; error: string | null; clearError: () => void;
  checkName: (name: string) => Promise<{ available: boolean; suggestions?: string[] }>;
  loginPhone: (phone: string, chosenPetName?: string) => Promise<{ success: boolean; sessionId: string; isLogin: boolean }>;
  verifySms: (phone: string, code: string) => Promise<{ sessionId: string }>; refreshToken: () => Promise<boolean>; logout: () => Promise<void>;
}

export interface WalletSliceState {
  coins: number; fetchCoins: () => Promise<void>;
  executeAction: (actionType: "buy_medicine" | "mini_game_reward" | "buy_shop_items", total: number, difficulty?: "easy" | "medium" | "hard" | "memory" | boolean) => Promise<boolean>;
}

export interface ApiStateCombined extends AuthSliceState, WalletSliceState {}

export const useApiStore = create<ApiStateCombined>()((set, get, ...a) => ({
  ...createAuthSlice(set, get, ...a),
  ...createWalletSlice(set, get, ...a)
}));

if (typeof window !== "undefined") useApiStore.setState({ coins: isMock ? 5000 : 0 });
