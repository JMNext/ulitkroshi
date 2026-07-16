import React, { useEffect } from 'react';
import { SuccessBubble } from './components/SuccessBubble';
import { FinalPlayButton } from './components/FinalPlayButton';
import { HappyPetVideo } from './components/HappyPetVideo';
import { useRegistrationStep4Store } from './useRegistrationStep4Store';
import { useRegistrationStep1Store } from '../Step_1/useRegistrationStep1Store'; // Для доступа к имени улитки
import { useMainGameStore } from '../../MainScene/useMainGameStore';

interface RegistrationUIWithStep4Props {
  onPlay: () => void;
}

export const RegistrationUI_Step4 = ({ onPlay }: RegistrationUIWithStep4Props) => {
  const resetStore = useRegistrationStep4Store((state) => state.resetStore);
  
  // Достаем имя улитки, введенное ребенком на первом шаге
  const snailName = useRegistrationStep1Store((state) => state.name) || 'Булька';

  useEffect(() => {
    // ТЗ: Передаем имя улитки в поле petName вашего главного игрового хранилища
    const setPetName = useMainGameStore.getState().setPetName;
    setPetName(snailName);

    // Отправка финального события onboarding_completed в Яндекс.Метрику
    if (typeof window !== "undefined" && (window as any).ym) {
      const COUNTER_ID = 12345678; // Номер счетчика Метрики
      (window as any).ym(COUNTER_ID, "reachGoal", "onboarding_completed");
      (window as any).ym(COUNTER_ID, "reachGoal", "login_success", { type: "registration_flow" });
    }

    return () => {
      resetStore();
    };
  }, [resetStore, snailName]);

  return (
    <main className="fixed inset-0 pointer-events-none w-full h-full font-sans select-none z-30 overflow-hidden">
      <SuccessBubble />
      <HappyPetVideo />
      <FinalPlayButton onClick={onPlay} />
    </main>
  );
};
