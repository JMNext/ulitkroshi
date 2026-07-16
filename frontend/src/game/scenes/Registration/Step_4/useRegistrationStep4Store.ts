import { create } from 'zustand';

interface Step4State {
  resetStore: () => void;
}

const initialValues = {};

export const useRegistrationStep4Store = create<Step4State>((set) => ({
  resetStore: () => set(initialValues),
}));
