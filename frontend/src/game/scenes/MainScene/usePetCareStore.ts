import { create } from 'zustand';

interface PetCareState {
  currentAnim: string;
  washState: 'idle' | 'hidden' | 'glowing';
  setCurrentAnim: (anim: string) => void;
  setWashState: (washState: 'idle' | 'hidden' | 'glowing') => void;
  canExecuteAction: (actionText: string) => boolean;
  triggerCareAction: (action: 'wash' | 'play' | 'eat', onSoundPlay?: (sound: string) => void) => void;
  triggerSleepAction: (onSoundPlay?: (sound: string) => void, onSoundStop?: () => void) => void;
  resetStore: () => void;
}

const initialValues = {
  currentAnim: 'prostoi1',
  washState: 'idle' as const,
};

let careTimeoutId: ReturnType<typeof setTimeout> | null = null;

export const usePetCareStore = create<PetCareState>((set, get) => ({
  ...initialValues,
  setCurrentAnim: (currentAnim) => set({ currentAnim }),
  setWashState: (washState) => set({ washState }),
  
  canExecuteAction: (actionText) => {
    const s = get().currentAnim;
    if (s === 'sleep_circle' || s === 'sleep_begin') return actionText === 'Спать';
    return s === 'prostoi1' || s === 'prostoi2';
  },

  triggerCareAction: (action, onSoundPlay) => {
    const { currentAnim } = get();
    if (currentAnim !== 'prostoi1' && currentAnim !== 'prostoi2') return;

    if (careTimeoutId) clearTimeout(careTimeoutId);
    if (onSoundPlay) onSoundPlay(action);

    set({ currentAnim: action, washState: 'hidden' });

    careTimeoutId = setTimeout(() => {
      set({ currentAnim: 'prostoi1', washState: 'idle' });
    }, 3500);
  },

  triggerSleepAction: (onSoundPlay, onSoundStop) => {
    const { currentAnim } = get();

    if (['prostoi1', 'prostoi2'].includes(currentAnim)) {
      set({ currentAnim: 'sleep_begin', washState: 'hidden' });

      if (careTimeoutId) clearTimeout(careTimeoutId);
      careTimeoutId = setTimeout(() => {
        set({ currentAnim: 'sleep_circle' });
        if (onSoundPlay) onSoundPlay('sleep');
      }, 3500);

    } else if (currentAnim === 'sleep_circle') {
      if (onSoundStop) onSoundStop();
      set({ currentAnim: 'sleep_awake', washState: 'hidden' });

      if (careTimeoutId) clearTimeout(careTimeoutId);
      careTimeoutId = setTimeout(() => {
        set({ currentAnim: 'prostoi1', washState: 'idle' });
      }, 3500);
    }
  },
  
  resetStore: () => {
    if (careTimeoutId) {
      clearTimeout(careTimeoutId);
      careTimeoutId = null;
    }
    set(initialValues);
  },
}));
