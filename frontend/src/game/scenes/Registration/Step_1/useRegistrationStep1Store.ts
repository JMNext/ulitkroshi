import { create } from 'zustand';
import { useAuthStore } from '../../../../store/useAuthStore';

interface Step1State {
  stage: number;
  name: string;
  input: string;
  
  // ТЗ: Новые поля проверки имени
  isNameChecking: boolean;       
  nameStatus: 'idle' | 'available' | 'taken'; 
  nameSuggestions: string[];     

  setInput: (val: string) => void;
  setStage: (stage: number) => void;
  submit: (value: string) => void;
  setSpeechResult: (text: string) => void;
  setSpeechError: () => void;
  resetStore: () => void;
  
  triggerNameCheck: (value: string) => Promise<void>;
}

const initialValues = {
  stage: 1,
  name: '',
  input: '',
  isNameChecking: false,
  nameStatus: 'idle' as const,
  nameSuggestions: [] as string[],
};

// Заменили тип NodeJS.Timeout на браузерный ReturnType для исправления ошибки TypeScript
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export const useRegistrationStep1Store = create<Step1State>((set, get) => ({
  ...initialValues,

  setInput: (val) => {
    set({ input: val });
    
    // ТЗ: Проверка уникальности имени с debounce 500ms
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!val.trim()) {
      set({ nameStatus: 'idle', nameSuggestions: [] });
      return;
    }

    set({ isNameChecking: true, nameStatus: 'idle' });

    debounceTimer = setTimeout(async () => {
      try {
        await get().triggerNameCheck(val);
      } catch (err) {
        set({ isNameChecking: false, nameStatus: 'idle' });
      }
    }, 500);
  },
  
  setStage: (stage) => set({ stage }),

  triggerNameCheck: async (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    try {
      const { checkName } = useAuthStore.getState();
      const result = await checkName(trimmed);

      if (result.available) {
        set({
          nameStatus: 'available',
          nameSuggestions: [],
          isNameChecking: false
        });
      } else {
        set({
          nameStatus: 'taken',
          // ТЗ: При занятом имени — предложить варианты (Улитка1, Улитка2...)
          nameSuggestions: result.suggestions && result.suggestions.length > 0 
            ? result.suggestions 
            : [`${trimmed}1`, `${trimmed}2`, `${trimmed}Игрок`],
          isNameChecking: false
        });
      }
    } catch (error) {
      set({ isNameChecking: false, nameStatus: 'idle' });
    }
  },

  submit: (value) => {
    const trimmed = value.trim();
    const formattedName = trimmed 
      ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
      : 'Булька';

    set({
      name: formattedName,
      stage: 2,
      input: '',
    });
  },

  setSpeechResult: (text) => {
    const trimmed = text.trim();
    const formattedSpeech = trimmed 
      ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
      : 'Булька';

    set({ name: formattedSpeech, input: formattedSpeech });
    get().triggerNameCheck(formattedSpeech).then(() => {
      if (get().nameStatus === 'available') {
        set({ stage: 2, input: '' });
      } else {
        set({ stage: 1 });
      }
    });
  },

  setSpeechError: () => set({ stage: 3 }),

  resetStore: () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    set(initialValues);
  },
}));
