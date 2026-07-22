import { create } from 'zustand';

interface PetCareState {
  currentAnim: string;
  washState: 'idle' | 'hidden' | 'glowing';
  setCurrentAnim: (anim: string) => void;
  setWashState: (washState: 'idle' | 'hidden' | 'glowing') => void;
  canExecuteAction: (actionText: string) => boolean;
  triggerCareAction: (action: 'wash' | 'play' | 'eat') => void;
  triggerSleepAction: () => void;
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
    if (s === 'sleep_circle' || s === 'sleep_begin' || s === 'sleep_awake') {
      return actionText === 'Спать';
    }
    return s === 'prostoi1' || s === 'prostoi2';
  },

  triggerCareAction: (action) => {
    const { currentAnim } = get();
    if (currentAnim !== 'prostoi1' && currentAnim !== 'prostoi2') return;

    if (careTimeoutId) clearTimeout(careTimeoutId);

    set({ currentAnim: action, washState: 'hidden' });

    // Личные тайминги для каждой анимации. Настраивай цифры здесь как хочешь
    const timeouts: Record<'wash' | 'play' | 'eat', number> = {
      eat: 2000,   // Еда вернется быстрее всего
      play: 3200,  // Для игры с мячом нужно чуть больше времени
      wash: 4000   // Душ длится дольше всех
    };

    careTimeoutId = setTimeout(() => {
      set({ currentAnim: 'prostoi1', washState: 'idle' });
    }, timeouts[action]);
  },

  triggerSleepAction: () => {
    const { currentAnim } = get();

    if (['prostoi1', 'prostoi2'].includes(currentAnim)) {
      set({ currentAnim: 'sleep_begin', washState: 'hidden' });
    } else if (currentAnim === 'sleep_circle') {
      set({ currentAnim: 'sleep_awake', washState: 'hidden' });
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
