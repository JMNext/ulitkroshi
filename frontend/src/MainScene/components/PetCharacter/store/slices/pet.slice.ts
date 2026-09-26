import { PET_LOCK_BUBBLES } from "@/MainScene/components/PetCharacter/constants/petCharacter.constants";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { useApiStore } from "@/api/store/useApiStore";
import { isMock } from "@/api/api";
import { StateCreator } from "zustand";
import { PetLogicState, PetMood, PetStateCombined } from "../usePetStore";
import { authApi } from "@/api/services/auth.api";

const SLEEP_ANIMS = ["sleep_circle", "sleep_begin", "sleep_awake"];
const BASE_ANIMS = ["prostoi1", "prostoi2", "sad_state"];
let timerId: any = null, moodIntervalId: any = null;

const clearTimer = () => { if (timerId) { clearInterval(timerId); timerId = null; } };

const sendBubbleText = (text: string | null) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ui_show_bubble", { detail: { text } }));
  }
};

const getRandomBuffPhrase = () => {
  const list = PET_LOCK_BUBBLES.buffActivePhrases || [];
  return list[Math.floor(Math.random() * list.length)] || "Я уже чистый!";
};

export const createPetLogicSlice: StateCreator<PetStateCombined, [], [], PetLogicState> = (set, get) => {
  const syncStats = (hp: number, xp: number, stars: number) => {
    const u = useApiStore.getState().user; const idx = get().activePetIndex || 0;
    if (!u) return;
    useApiStore.setState({ user: { ...u,
      petHealths: (u.petHealths || []).map((v, i) => i === idx ? hp : v),
      petExperiences: (u.petExperiences || []).map((v, i) => i === idx ? xp : v),
      petStars: (u.petStars || []).map((v, i) => i === idx ? stars : v)
    } });
    authApi.syncPetStats(hp, xp, stars, idx).catch(() => {});
  };

  if (!moodIntervalId) {
    moodIntervalId = setInterval(() => {
      const s = get(); if (SLEEP_ANIMS.includes(s.currentAnim) || s.mood === "sad" || Date.now() < s.buffUntil) return;
      const roll = Math.random(), nextMood: PetMood = roll < 0.25 ? "sad" : roll < 0.6 ? "neutral" : "happy";
      if (nextMood !== s.mood) set({ mood: nextMood, currentAnim: nextMood === "sad" && ["prostoi1", "prostoi2"].includes(s.currentAnim) ? "sad_state" : s.currentAnim });
    }, 180000);
  }

  const initCount = useApiStore.getState().user?.unlockedPets || 1;

  return {
    hp: 100, miniGamesClickCount: 0, activePetIndex: 0, currentAnim: "prostoi1", washState: "idle", mood: "happy", experience: 0, stars: 1, buffUntil: 0, unlockedPetIndexes: Array.from(new Array(initCount).keys()),
    canExecuteAction: (t) => SLEEP_ANIMS.includes(get().currentAnim) ? t === "sleep" : BASE_ANIMS.includes(get().currentAnim),
    triggerCareAction: (action) => {
      if (action === "wash" && Date.now() < get().buffUntil) {
        sendBubbleText(getRandomBuffPhrase());
        return;
      }
      set({ currentAnim: action, washState: "hidden" });
    },
    completeCareAction: () => {
      const { currentAnim, hp, mood, experience, stars } = get();
      if (currentAnim === "sleep_begin") {
        set({ currentAnim: "sleep_circle", washState: "hidden" }); clearTimer();
        timerId = setInterval(() => {
          const next = Math.min(100, get().hp + 25); set({ hp: next }); syncStats(next, get().experience || 0, get().stars || 1);
          if (next >= 100) { clearTimer(); get().triggerSleepAction(); }
        }, 60000); return;
      }
      if (currentAnim === "sleep_awake") {
        sendBubbleText(null);
        useMainGameStore.getState().setAlertText(null);
      }
      let nextMood = mood, nextXp = experience, nextStars = stars, nextBuff = get().buffUntil;

      if (currentAnim === "wash") {
        nextBuff = Date.now() + 180000;
        nextMood = "happy";
      }

      if (currentAnim === "play") {
        nextMood = Math.random() < 0.6 ? "happy" : "neutral";
        syncStats(hp, nextXp, nextStars);
      }
      const nextAnim = hp <= 25 || nextMood === "sad" ? "sad_state" : (["wash", "play", "eat"].includes(currentAnim) && Math.random() < 0.3 ? "prostoi2" : "prostoi1");

      setTimeout(() => {
        set({ currentAnim: nextAnim, washState: nextAnim.startsWith("sleep") ? "hidden" : "idle", mood: nextMood, experience: nextXp, stars: nextStars, buffUntil: nextBuff });
      }, 30);
    },
    triggerSleepAction: () => BASE_ANIMS.includes(get().currentAnim) ? get().triggerCareAction("sleep_begin") : (["sleep_circle", "sleep_begin"].includes(get().currentAnim) ? (clearTimer(), get().triggerCareAction("sleep_awake")) : null),
    incrementMiniGamesClick: () => {
      if (SLEEP_ANIMS.includes(get().currentAnim)) return PET_LOCK_BUBBLES.sleepAlert;
      if (get().mood === "sad") {
        return "Мне грустно, я не хочу играть в mini-игры... Поиграй со мной в мячик!";
      }
      set((s) => ({ miniGamesClickCount: s.miniGamesClickCount + 1 }));
      const fList = [...(PET_LOCK_BUBBLES.funnyPhrases || []), PET_LOCK_BUBBLES.default || ""];
      return fList[Math.floor(Math.random() * fList.length)] || "";
    },
    unlockPet: async (idx) => {
      const cur = useApiStore.getState().user?.unlockedPets || 1;
      if (idx >= cur) {
        const u = useApiStore.getState().user; if (u) useApiStore.setState({ user: { ...u, unlockedPets: cur + 1 } });
        set({ unlockedPetIndexes: Array.from(new Array(cur + 1).keys()) });
      }
    },
    handleGameLoss: () => {
      const next = Math.max(1, get().hp - 25);
      const nextMood = Date.now() < get().buffUntil ? "happy" : (Math.random() < 0.5 ? "sad" : get().mood);
      set({ hp: next, mood: nextMood, currentAnim: (next <= 25 || nextMood === "sad") && !SLEEP_ANIMS.includes(get().currentAnim) ? "sad_state" : get().currentAnim });
      syncStats(next, get().experience || 0, get().stars || 1);
    }
  };
};
