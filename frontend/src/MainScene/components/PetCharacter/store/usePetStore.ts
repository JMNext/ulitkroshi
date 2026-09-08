
import { create } from 'zustand';
import { PET_LOCK_BUBBLES } from "@/MainScene/components/PetCharacter/petCharacter.constants";
import { authApi } from '@/api/authApi';

export interface PetState {
  petName: string; hp: number; isMiniGamesBlocked: boolean; miniGamesClickCount: number; activePetIndex: number; unlockedPetIndexes: number[]; currentAnim: string; washState: 'idle' | 'hidden' | 'glowing'; fruitsCooldowns: Record<string, number>; fruitsCounts: Record<string, number>; activeFruitIds: Record<string, number>; currentFruitId: string; petTargetX: number; petTargetY: number;
  updateField: <K extends keyof PetState>(field: K, value: PetState[K]) => void;
  setPetTargetCoordinates: (x: number, y: number) => void;
  setCurrentFruitId: (id: string) => void;
  canExecuteAction: (type: 'feed' | 'wash' | 'play' | 'sleep') => boolean;
  triggerCareAction: (action: 'wash' | 'play' | 'eat' | 'eat_fruit') => void; 
  completeCareAction: () => void;
  triggerSleepAction: () => void; 
  incrementMiniGamesClick: () => string;
  useFruitId: (id: string, hpRestoreValue: number, restoresHp: boolean, isStandard?: boolean) => 'SUCCESS' | 'FULL_HP' | 'COOLDOWN_OR_EMPTY';
  addFruitsToInventory: (slotId: string, fid: number, q: number) => void;
  unlockPet: (index: number) => Promise<void>;
  handleGameLoss: () => void;
  resetStore: () => void;
}

const SLEEP_ANIMATIONS = ['sleep_circle', 'sleep_begin', 'sleep_awake'];
const BASE_ANIMATIONS = ['prostoi1', 'prostoi2', 'sad_state'];

const initialFruits = {
  fruitsCooldowns: { fruit_01: 0, fruit_02: 0, fruit_03: 0, fruit_04: 0 }, 
  fruitsCounts: { fruit_01: 0, fruit_02: 0, fruit_03: 0, fruit_04: 0 }, 
  activeFruitIds: { fruit_01: 1, fruit_02: 5, fruit_03: 9, fruit_04: 13 },
};

export const usePetStore = create<PetState>((set, get) => ({
  petName: 'Булька', hp: 100, isMiniGamesBlocked: false, miniGamesClickCount: 0, activePetIndex: 0, unlockedPetIndexes:[0], currentAnim: 'prostoi1', washState: 'idle', 
  ...initialFruits,
  currentFruitId: '', petTargetX: 960, petTargetY: 518,

  updateField: (f, v) => set((s) => {
    const nextState = { ...s, [f]: v };
    if (f === 'hp') nextState.isMiniGamesBlocked = false;
    return nextState;
  }),

  setPetTargetCoordinates: (x, y) => set({ petTargetX: x, petTargetY: y }),
  
  setCurrentFruitId: (id) => set({ currentFruitId: id }),
  
  canExecuteAction: (t) => {
    const { currentAnim } = get();
    return SLEEP_ANIMATIONS.includes(currentAnim) ? t === 'sleep' : BASE_ANIMATIONS.includes(currentAnim);
  },
  
  triggerCareAction: (a) => set({ currentAnim: a, washState: 'hidden' }),
  
  completeCareAction: () => {
    const { currentAnim, hp } = get();
    if (currentAnim === 'sleep_begin') return set({ currentAnim: 'sleep_circle' });
    
    if (currentAnim === 'sleep_awake') {
      window.dispatchEvent(new CustomEvent("ui_show_bubble", { detail: { text: null } }));
      return set({ currentAnim: hp <= 25 ? 'sad_state' : 'prostoi1', washState: 'idle' });
    }
    
    if (![...SLEEP_ANIMATIONS, 'sad_state', 'prostoi1', 'prostoi2'].includes(currentAnim)) {
      set({ currentAnim: hp <= 25 ? 'sad_state' : (Math.random() < 0.3 ? 'prostoi2' : 'prostoi1'), washState: 'idle' });
    }
  },
  
  triggerSleepAction: () => {
    const a = get().currentAnim;
    if (BASE_ANIMATIONS.includes(a)) set({ currentAnim: 'sleep_begin', washState: 'hidden' });
    else if (a === 'sleep_circle') set({ currentAnim: 'sleep_awake', washState: 'hidden' });
  },
  
  incrementMiniGamesClick: () => {
    const { currentAnim, miniGamesClickCount } = get();
    if (SLEEP_ANIMATIONS.includes(currentAnim)) return PET_LOCK_BUBBLES.sleepAlert;
    
    const nextCount = miniGamesClickCount + 1;
    set({ miniGamesClickCount: nextCount });
    
    return nextCount >= PET_LOCK_BUBBLES.triggerCount 
      ? PET_LOCK_BUBBLES.funnyPhrases[Math.floor(Math.random() * PET_LOCK_BUBBLES.funnyPhrases.length)] 
      : PET_LOCK_BUBBLES.default;
  },
  
  useFruitId: (id, val, rHp, isStandard = false) => {
    const { fruitsCooldowns, fruitsCounts, hp, currentAnim } = get();
    if (!isStandard && hp >= 100 && rHp) return 'FULL_HP';

    let cnt = fruitsCounts[id] ?? 0;
    let actualStd = isStandard;
    let actualVal = val;
    let actualRHp = rHp;

    if (cnt <= 0 && !isStandard) { 
      actualStd = true; 
      actualVal = 1; 
      actualRHp = true; 
    }

    const now = Date.now();
    if (!actualStd && now < ((fruitsCooldowns[id] ?? 0) - now > 600000 ? 0 : (fruitsCooldowns[id] ?? 0))) {
      return 'COOLDOWN_OR_EMPTY';
    }

    const cd = actualStd ? 10000 : (!actualRHp ? 180000 : (actualVal === 100 ? 300000 : (actualVal <= 25 ? 95000 : 180000)));
    const nextHp = Math.min(100, hp + (actualStd ? (hp < 10 ? 1 : 0) : (actualRHp ? actualVal : 0)));
    const updatedCount = cnt - 1;
    
    set({
      hp: nextHp, 
      isMiniGamesBlocked: false, 
      miniGamesClickCount: 0,
      currentAnim: nextHp > 25 && currentAnim === 'sad_state' ? 'prostoi1' : currentAnim,
      fruitsCounts: actualStd ? fruitsCounts : { ...fruitsCounts, [id]: updatedCount },
      fruitsCooldowns: actualStd ? fruitsCooldowns : { ...fruitsCooldowns, [id]: now + cd }
    });

    if (id && (actualStd ? cnt : updatedCount) <= 0) {
      set({ currentFruitId: '' });
    }

    return 'SUCCESS';
  },
  
  addFruitsToInventory: (sid, fid, q) => set((s) => ({
    fruitsCounts: { ...s.fruitsCounts, [sid]: (s.fruitsCounts[sid] ?? 0) + q }, 
    activeFruitIds: { ...s.activeFruitIds, [sid]: fid }
  })),
  
  unlockPet: async (i) => {
    const idxs = get().unlockedPetIndexes; 
    if (idxs.includes(i)) return;

    const up = [...idxs, i]; 
    set({ unlockedPetIndexes: up });
    try { 
      await authApi.updateUnlockedPets(up); 
    } catch (e) { 
      console.error(e); 
    }
  },
  
  handleGameLoss: () => {
    const { hp, currentAnim } = get(); 
    const nh = Math.max(1, hp - 25);
    set({ 
      hp: nh, 
      isMiniGamesBlocked: false, 
      currentAnim: (nh <= 25 && !SLEEP_ANIMATIONS.includes(currentAnim)) ? 'sad_state' : currentAnim 
    });
  },
  
  resetStore: () => {
    set((s) => ({
      hp: 100, isMiniGamesBlocked: false, miniGamesClickCount: 0, activePetIndex: 0, unlockedPetIndexes:[0], currentAnim: 'prostoi1', washState: 'idle', 
      ...initialFruits,
      currentFruitId: '', petTargetX: 960, petTargetY: 518, petName: s.petName
    }));
    localStorage.setItem("mock_unlocked_pets", JSON.stringify([0]));
  }
}));
