import { EventBus } from "@/eventbus/EventBus";
import { useEffect } from "react";
import { FinalPlayButton } from "./components/FinalPlayButton";
import { HappyPetVideo } from "./components/HappyPetVideo";
import { SuccessBubble } from "./components/SuccessBubble";
import { Step4Scene } from "./Step4Scene";
import { useRegistrationStep4Store } from "./store/useRegistrationStep4Store";

export function Step4UiManager({ phaserScene }: { phaserScene: Step4Scene }) {
  const { layoutContext: ctx, finalScale, setLayout } = useRegistrationStep4Store();

  useEffect(() => {
    const handleResize = (d: any) => setLayout({ screenMode: d.screenMode, viewW: d.viewW, scale: d.scale, isVert: d.isVert }, d.finalScale);
    phaserScene.events.on("phaser_scene_resize", handleResize);
    if (phaserScene.sys.isActive()) phaserScene.triggerResize();
    return () => { phaserScene.events.off("phaser_scene_resize", handleResize); };
  }, [phaserScene, setLayout]);

  if (!ctx) return null;
  const isMob = ctx.screenMode === "mobile" || ctx.screenMode === "fold";

  const handlePlay = () => {
    if (!phaserScene.sys.isActive()) return;
    phaserScene.cameras.main.fadeOut(200, 0, 0, 0);
    phaserScene.time.delayedCall(200, () => {
      if (!phaserScene.sys.isActive()) return;
      EventBus.emit("step4_scene_stop"); EventBus.emit("main_scene_start");
      phaserScene.scene.stop("Step4Scene"); phaserScene.scene.start("MainScene");
    });
  };

  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden select-none">
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 box-border flex h-[1080px] w-[1920px] flex-col items-center justify-center opacity-100 transition-opacity [backface-visibility:hidden]" style={{ transform: `translate(-50%, -50%) scale(${finalScale})` }}>
        <HappyPetVideo /> <SuccessBubble />
        <div className="pointer-events-none absolute top-[865px] left-1/2 z-10 origin-center" style={{ transform: `translate(-50%, -50%) scale(${isMob ? 1.2 : 1})` }}>
          <FinalPlayButton onClick={handlePlay} />
        </div>
      </div>
    </div>
  );
}
