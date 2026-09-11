import React from "react";
import { useRegistrationStep1Store } from "../store/useRegistrationStep1Store";

export const ConfirmSelection = () => {
  const setStage = useRegistrationStep1Store((state) => state.setStage);

  const handleConfirmClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setStage(4);

    const globalContext = (window as any).__phaserSceneContext || (useRegistrationStep1Store as any).phaserScene;
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
