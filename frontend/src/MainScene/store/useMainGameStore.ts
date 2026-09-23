import { AvatarId } from "@/MainScene/components/ProfileEdit/components/Avatars";
import { useApiStore } from "@/api/store/useApiStore";
import { EventBus } from "@/eventbus/EventBus";
import Phaser from "phaser";
import { create } from "zustand";
import { createGameplaySlice } from "./slices/gameplay.slice";
import { createProfileSlice } from "./slices/profile.slice";

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
  setIsHelpShown: (shown) => set({ isHelpShown: shown }),
  setUpdatingCoinsGlobal: (val) => { isUpdatingCoinsGlobal = val; },
  resetStore: async () => {
    set({ avatarId: "default", modal: null, isHelpShown: false, alertText: null, isFoodOpen: false, gameOverResult: null });
    if (typeof window !== "undefined") {
      EventBus.emit("main_scene_stop"); EventBus.emit("login_scene_start");
      const win = window as any;
      if (win.phaserGame) { win.phaserGame.scene.stop("MainScene"); win.phaserGame.scene.start("LoginScene"); }
    }
    await useApiStore.getState().fetchCoins();
  }
}));

useApiStore.subscribe((state) => {
  const u = state.user as any;
  if (!u || isUpdatingCoinsGlobal) return;

  const disc = u.discriminator ? String(u.discriminator).trim() : (u.name?.includes("#") ? u.name.split("#").pop() || "0000" : "0000");
  const localName = typeof window !== "undefined" ? localStorage.getItem("local_saved_username") : null;
  let name = localName?.trim() || u.name || (u.id ? `Player_${u.id}` : "Player_12345");
  if (name.includes("#")) name = name.split("#")[0].trim();

  useMainGameStore.setState({ coins: state.coins || 0, username: name, discriminator: disc, userId: u.id ? Number(u.id) : null });
});
