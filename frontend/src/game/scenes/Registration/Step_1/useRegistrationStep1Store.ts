import { create } from 'zustand';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useMainGameStore } from '../../MainScene/useMainGameStore';

interface Step1State {
  stage: number; name: string; input: string; isNameChecking: boolean;       
  nameStatus: 'idle' | 'available' | 'taken'; nameSuggestions: string[];     
  nameHistory: string[];
  setInput: (val: string) => void; setStage: (stage: number) => void;
  submit: (value: string) => void; setSpeechResult: (text: string) => void;
  setSpeechError: () => void; resetStore: () => void;
  triggerNameCheck: (value: string) => Promise<boolean>; selectSuggestion: (suggestion: string) => void;
}

const initialValues = {
  stage: 1, name: '', input: '', isNameChecking: false,
  nameStatus: 'idle' as const, nameSuggestions: [] as string[],
  nameHistory: [] as string[],
};

const formatName = (s: string) => s.trim() ? s.trim().charAt(0).toUpperCase() + s.trim().slice(1) : 'Булька';

export const useRegistrationStep1Store = create<Step1State>((set, get) => ({
  ...initialValues,

  setInput: (val) => {
    set({ input: val, nameStatus: 'idle', nameSuggestions: [] });
  },
  
  setStage: (stage) => {
    if (stage === 1 && get().stage === 2) {
      const currentName = get().name;
      const history = get().nameHistory;
      set({ 
        stage, 
        nameHistory: currentName && !history.includes(currentName) ? [...history, currentName] : history 
      });
    } else {
      set({ stage });
    }
  },

  triggerNameCheck: async (value) => {
    const trimmed = value.trim();
    if (!trimmed) return false;

    set({ isNameChecking: true, nameStatus: 'idle' });
    try {
      const [result] = await Promise.all([
        useAuthStore.getState().checkName(trimmed),
        new Promise((resolve) => setTimeout(resolve, 900))
      ]);
      
      const isAvailable = !!result.available;
      
      // Если имя свободно, сразу прокидываем его в глобальный игровой стор
      if (isAvailable) {
        useMainGameStore.getState().setPetName(trimmed);
      }
      
      set({
        isNameChecking: false,
        nameStatus: isAvailable ? 'available' : 'taken',
        nameSuggestions: isAvailable ? [] : (result.suggestions?.length ? result.suggestions : [`${trimmed}1`, `${trimmed}2`, `${trimmed}Игрок`]),
        stage: isAvailable ? 2 : 1,
        ...(isAvailable ? {} : { input: trimmed })
      });
      return isAvailable;
    } catch {
      set({ isNameChecking: false, nameStatus: 'idle', stage: 1 });
      return false;
    }
  },

  selectSuggestion: (suggestion) => {
    const formatted = formatName(suggestion);
    
    // Синхронизируем имя при клике на готовую подсказку
    useMainGameStore.getState().setPetName(formatted);

    set({ input: '', name: formatted, nameStatus: 'available', nameSuggestions: [], stage: 2 });
  },

  submit: async (value) => {
    const formatted = formatName(value);
    set({ name: formatted, input: '' });
    await get().triggerNameCheck(formatted);
  },

  setSpeechResult: (text) => {
    const currentInput = get().input.trim();
    
    if (!text.trim()) {
      if (currentInput) {
        const formatted = formatName(currentInput);
        set({ name: formatted, input: '' });
        get().triggerNameCheck(formatted);
      } else {
        set({ stage: 3 });
      }
      return;
    }

    const formatted = formatName(text);
    set({ name: formatted, input: '' });
    get().triggerNameCheck(formatted);
  },

  setSpeechError: () => {
    const currentInput = get().input.trim();
    if (currentInput) {
      const formatted = formatName(currentInput);
      set({ name: formatted, input: '' });
      get().triggerNameCheck(formatted);
    } else {
      set({ stage: 3 });
    }
  },

  resetStore: () => {
    set(initialValues);
  },
}));
