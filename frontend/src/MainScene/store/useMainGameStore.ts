import { AvatarId } from "@/MainScene/components/ProfileEdit/components/Avatars";
import { useApiStore } from "@/api/store/useApiStore";
import { isMock } from "@/api/api";
import { EventBus } from "@/eventbus/EventBus";
import Phaser from "phaser";
import { create } from "zustand";
import { createGameplaySlice } from "./slices/gameplay.slice";
import { createProfileSlice } from "./slices/profile.slice";
import { UserProfile } from "@/api/types/types";
import { DEFAULT_USER_PROFILE, getMockCoins } from "@/api/services/auth.api";

export interface CustomWindow extends Window { phaserGame: Phaser.Game | null; }

export interface ProfileState {
  coins: number; username: string; discriminator: string; avatarId: AvatarId; userId: number | null;
  buyFruit: (slotId: string, fruitId: number, qty: number, cost: number) => Promise<boolean>;
  setUsername: (name: string) => Promise<void>; setAvatarId: (id: AvatarId) => void; addPetByCode: (code: string) => boolean;
}

export interface GameplayState {
  modal: string | null; alertText: string | null; isFoodOpen: boolean; isHelpShown: boolean;
  gameOverResult: { isWin: boolean; rewardText: string } | null;
  startScanner: () => void; setModal: (modal: string | null) => void; setAlertText: (text: string | null) => void;
  setIsFoodOpen: (open: boolean | ((prev: boolean) => boolean)) => void; setIsHelpShown: (shown: boolean) => void;
  setGameOver: (score: number | undefined, difficulty: "easy" | "medium" | "hard" | "memory" | undefined, initialIsWin: boolean) => Promise<void>;
  clearGameOver: () => void;
}

export interface MainGameStateCombined extends ProfileState, GameplayState {
  resetStore: () => Promise<void>; setUpdatingCoinsGlobal: (val: boolean) => void;
}

let isUpdatingCoinsGlobal = false;

export const useMainGameStore = create<MainGameStateCombined>()((set, get, ...a) => ({
  ...createProfileSlice(set, get, ...a),
  ...createGameplaySlice(set, get, ...a),
  isHelpShown: false,
  setIsHelpShown: (shown) => {
    set({ isHelpShown: shown });
    if (!shown && !isMock && typeof window !== "undefined") {
      const currentUserId = get().userId;
      if (currentUserId) {
        localStorage.setItem(`guide_viewed_${currentUserId}`, "true");
      }
    }
  },
  setUpdatingCoinsGlobal: (val) => { isUpdatingCoinsGlobal = val; },
  resetStore: async () => {
    // Безопасное обнуление: принудительно затираем coins в 0 вместе с остальными полями сессии
    set({ coins: 0, avatarId: "default", modal: null, username: "", discriminator: "0000", userId: null, isHelpShown: false, alertText: null, isFoodOpen: false, gameOverResult: null });

    if (typeof window !== "undefined") {
      EventBus.emit("main_scene_stop"); EventBus.emit("login_scene_start");
      const win = window as unknown as CustomWindow;
      if (win.phaserGame) { win.phaserGame.scene.stop("MainScene"); win.phaserGame.scene.start("LoginScene"); }
    }
    await useApiStore.getState().fetchCoins();
  }
}));

useApiStore.subscribe((state) => {
  if (isUpdatingCoinsGlobal) return;
  const u = state.user as UserProfile | null;

  if (!u && !isMock) return;

  const activeUser = u || { ...DEFAULT_USER_PROFILE, coins: getMockCoins() };
  const extendedUser = activeUser as UserProfile & { name?: string; username?: string; tgName?: string; discriminator?: string; tag?: string };

  const rawName = extendedUser.name || extendedUser.player_name || extendedUser.username || extendedUser.tgName || "Player#1000";
  let namePart = String(rawName).trim();
  let discPart = "1000";

  if (namePart.includes("#")) {
    const parts = namePart.split("#");
    namePart = parts ? String(parts[0]).trim() : "Player";
    discPart = parts ? String(parts[1]).trim() : "1000";
  } else if (extendedUser.discriminator || extendedUser.tag) {
    discPart = String(extendedUser.discriminator || extendedUser.tag).trim();
  } else if (extendedUser.id) {
    discPart = String(extendedUser.id).padStart(4, "0");
  }

  if (!namePart || namePart === "undefined" || namePart === "null") {
    namePart = "Player";
  }
  if (!discPart || discPart === "undefined" || discPart === "null") {
    discPart = "1000";
  }

  let localName: string | null = null;
  if (typeof window !== "undefined" && extendedUser.id) {
    localName = localStorage.getItem(`local_saved_username_${extendedUser.id}`);
  }
  if (localName) namePart = localName.trim();

  const nextState: any = {
    coins: u ? (state.coins !== undefined && state.coins !== null ? state.coins : (u.coins || 0)) : useMainGameStore.getState().coins,
    username: namePart,
    discriminator: discPart,
    userId: extendedUser.id ? Number(extendedUser.id) : null
  };

  if (!isMock && extendedUser.id && typeof window !== "undefined") {
    const savedFlag = localStorage.getItem(`guide_viewed_${extendedUser.id}`);
    nextState.isHelpShown = savedFlag !== "true";
  }

  useMainGameStore.setState(nextState);
});

if (typeof window !== "undefined") {
  const state = useApiStore.getState();
  if (isMock) {
    useApiStore.setState({ user: { ...DEFAULT_USER_PROFILE, coins: getMockCoins() }, coins: getMockCoins(), isAuthenticated: true });
  } else if (!state.user && typeof state.restoreSession === "function") {
    state.restoreSession().catch(() => {});
  }
}
