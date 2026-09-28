import { useRegistrationStep1Store } from "../store/useRegistrationStep1Store";

declare global {
  interface Window { __phaserSceneContext?: { scene?: { scene?: any } }; }
}

export const ConfirmSelection = () => {
  const setStage = useRegistrationStep1Store((s) => s.setStage);

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    setStage(4);
    const ctx = window.__phaserSceneContext || (useRegistrationStep1Store as any).phaserScene;
    ctx?.scene?.scene ? ctx.scene.scene.start("Step2Scene") : window.dispatchEvent(new CustomEvent("switch_scene_forced", { detail: "login" }));
  };

  return (
    <div className="flex h-[64px] w-[400px] items-center justify-center gap-6">
      <button type="button" onClick={() => setStage(1)} className="pointer-events-auto box-border flex h-full w-[180px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#ff5252] to-[#e63254] px-6 text-[24px] font-black tracking-wide text-white uppercase shadow-md transition-transform outline-none select-none active:scale-95">Нет</button>
      <button type="button" onClick={handleConfirm} className="pointer-events-auto box-border flex h-full w-[180px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-6 text-[24px] font-black tracking-wide text-white uppercase shadow-md transition-transform outline-none select-none active:scale-95">Да!</button>
    </div>
  );
};
