import { create } from 'zustand';

interface PetCareState {
  petName: string;
  hp: number;
  activePetIndex: number;
  currentAnim: string;
  washState: 'idle' | 'hidden' | 'glowing';
  careTimeoutId: ReturnType<typeof setTimeout> | null;
  setPetName: (name: string) => void;
  setHp: (hp: number) => void;
  setActivePetIndex: (index: number) => void;
  setCurrentAnim: (anim: string) => void;
  setWashState: (washState: 'idle' | 'hidden' | 'glowing') => void;
  canExecuteAction: (actionText: string) => boolean;
  triggerCareAction: (action: 'wash' | 'play' | 'eat') => void;
  triggerSleepAction: () => void;
  resetStore: () => void;
}

const initialValues = {
  petName: 'Булька',
  hp: 100,
  activePetIndex: 0,
  currentAnim: 'prostoi1',
  washState: 'idle' as const,
  careTimeoutId: null as ReturnType<typeof setTimeout> | null,
};

export const usePetCareStore = create<PetCareState>((set, get) => ({
  ...initialValues,

  setPetName: (petName) => set({ petName }),
  setHp: (hp) => set({ hp }),
  setActivePetIndex: (activePetIndex) => set({ activePetIndex }),
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
    const { currentAnim, careTimeoutId } = get();
    if (currentAnim !== 'prostoi1' && currentAnim !== 'prostoi2') return;

    if (careTimeoutId) clearTimeout(careTimeoutId);

    set({ currentAnim: action, washState: 'hidden' });

    const timeouts: Record<'wash' | 'play' | 'eat', number> = {
      eat: 2000,   // Еда вернется быстрее всего
      play: 3200,  // Для игры с мячом нужно чуть больше времени
      wash: 4000   // Душ длится дольше всех
    };

    const id = setTimeout(() => {
      set({ currentAnim: 'prostoi1', washState: 'idle', careTimeoutId: null });
    }, timeouts[action]);

    set({ careTimeoutId: id });
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
    const { careTimeoutId } = get();
    if (careTimeoutId) clearTimeout(careTimeoutId);
    
    set((state) => ({
      ...initialValues,
      petName: state.petName,
    }));
  },
}));
