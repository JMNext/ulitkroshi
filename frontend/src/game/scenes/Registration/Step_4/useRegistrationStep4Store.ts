import { create } from 'zustand';

interface Step4State {
  resetStore: () => void;
}

export const useRegistrationStep4Store = create<Step4State>((set) => ({
  resetStore: () => set({}),
}));
