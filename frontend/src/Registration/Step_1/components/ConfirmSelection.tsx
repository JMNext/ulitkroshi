import { useRegistrationStep1Store, Step1State } from "../store/useRegistrationStep1Store";

// 1. Расширяем глобальный интерфейс Window
declare global {
  interface Window {
    __phaserSceneContext?: any;
  }
}

// 2. Расширяем типы Zustand-стора, сообщая TS, что на нём может висеть phaserScene
interface ExtendedStep1Store extends Step1State {
  phaserScene?: any;
}

export const ConfirmSelection = () => {
  const setStage = useRegistrationStep1Store((state) => state.setStage);

  const handleConfirmClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setStage(4);

    // Кастуем Zustand-стор к расширенному типу ExtendedStep1Store
    const storeWithPhaser = useRegistrationStep1Store as unknown as ExtendedStep1Store;
    const globalContext = window.__phaserSceneContext || storeWithPhaser.phaserScene;

    if (globalContext?.scene?.start) {
      globalContext.scene.start("Step2Scene");
    } else {
      window.dispatchEvent(new CustomEvent("switch_scene_forced", { detail: "login" }));
    }
  };

  return (
    <div className="flex h-[64px] w-[400px] items-center justify-center gap-6">
      <button
        type="button"
        onClick={() => setStage(1)}
        className="pointer-events-auto box-border flex h-full w-[180px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#ff5252] to-[#e63254] px-6 text-[24px] font-black tracking-wide text-white uppercase shadow-md transition-transform outline-none select-none active:scale-95"
      >
        Нет
      </button>
      <button
        type="button"
        onClick={handleConfirmClick}
        className="pointer-events-auto box-border flex h-full w-[180px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-6 text-[24px] font-black tracking-wide text-white uppercase shadow-md transition-transform outline-none select-none active:scale-95"
      >
        Да!
      </button>
    </div>
  );
};
