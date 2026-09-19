import { AvatarId } from "@/MainScene/components/Avatars/Avatars";
import { useApiStore } from "@/api/store/useApiStore";
import { EventBus } from "@/eventbus/EventBus";
import Phaser from "phaser";
import { create } from "zustand";
import { createGameplaySlice } from "./slices/gameplay.slice";
import { createProfileSlice } from "./slices/profile.slice";

export interface MainGameStyles {
  header: React.CSSProperties;
  sideLeft: React.CSSProperties;
  sideRight: React.CSSProperties;
  food: React.CSSProperties;
  bottom: React.CSSProperties;
  pet: React.CSSProperties;
}

export interface CustomWindow extends Window {
  phaserGame: Phaser.Game | null;
}

export interface ProfileState {
  coins: number;
  username: string;
  avatarId: AvatarId;
  userId: number | null;
  buyFruit: (slotId: string, fruitId: number, qty: number, cost: number) => Promise<boolean>;
  setUsername: (name: string) => Promise<void>;
  setAvatarId: (id: AvatarId) => void;
  addPetByCode: (code: string) => boolean;
}

export interface GameplayState {
  modal: string | null;
  alertText: string | null;
  isFoodOpen: boolean;
  width: number;
  height: number;
  isVert: boolean;
  isPortrait: boolean;
  scale: number;
  finalScale: number;
  s: number;
  styles: MainGameStyles | null;
  gameOverResult: { isWin: boolean; rewardText: string } | null;
  startScanner: () => void;
  setModal: (modal: string | null) => void;
  setAlertText: (text: string | null) => void;
  setIsFoodOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setLayoutData: (data: { scale: number; finalScale: number; s: number; width: number; height: number; styles: MainGameStyles }) => void;
  setGameOver: (
    score: number | undefined,
    difficulty: "easy" | "medium" | "hard" | "memory" | undefined,
    initialIsWin: boolean
  ) => Promise<void>;
  clearGameOver: () => void;
}

export interface MainGameStateCombined extends ProfileState, GameplayState {
  resetStore: () => Promise<void>;
  setUpdatingCoinsGlobal: (val: boolean) => void;
}

let isUpdatingCoinsGlobal = false;

export const useMainGameStore = create<MainGameStateCombined>()((set, get, ...a) => ({
  ...createProfileSlice(set, get, ...a),
  ...createGameplaySlice(set, get, ...a),

  setUpdatingCoinsGlobal: (val) => {
    isUpdatingCoinsGlobal = val;
  },

  resetStore: async () => {
    set({ avatarId: "default", modal: "help", alertText: null, isFoodOpen: false, gameOverResult: null, styles: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem("local_saved_username");
      EventBus.emit("main_scene_stop");
      EventBus.emit("login_scene_start");
      const customWindow = window as unknown as CustomWindow;
      if (customWindow.phaserGame) {
        customWindow.phaserGame.scene.stop("MainScene");
        customWindow.phaserGame.scene.start("LoginScene");
      }
    }
    await useApiStore.getState().fetchCoins();
  }
}));

useApiStore.subscribe((state) => {
  if (state.user && !isUpdatingCoinsGlobal) {
    const localName = typeof window !== "undefined" ? localStorage.getItem("local_saved_username") : null;
    const fallbackName = state.user.id ? `Player_${state.user.id}` : "Player_12345";

    const finalName = localName && localName.trim() ? localName.trim() : (state.user.name || fallbackName);

    useMainGameStore.setState({
      coins: state.coins || 0,
      username: finalName,
      userId: state.user.id ? Number(state.user.id) : null
    });
  }
});
