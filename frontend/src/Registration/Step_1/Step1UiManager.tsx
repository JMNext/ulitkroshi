import { EventBus } from "@/eventbus/EventBus";
import { useRegistrationStep1Store } from "@/Registration/Step_1/store/useRegistrationStep1Store";
import Phaser from "phaser";
import { useEffect } from "react";
import { BubbleBlock } from "./components/BubbleBlock";
import { ConfirmSelection } from "./components/ConfirmSelection";
import { NextButton } from "./components/NextButton";
import { PetVideoBlock } from "./components/PetVideoBlock";
import { SpeechInputField } from "./components/SpeechInputField";
import { SpeechMicButton } from "./components/SpeechMicButton";
import { Step1Scene } from "./Step1Scene";

export function Step1UiManager({ phaserScene }: { phaserScene: Step1Scene }) {
  const { stage, layoutContext: ctx, finalScale, setLayout, setStage } = useRegistrationStep1Store();

  useEffect(() => {
    const handleResize = (d: any) => setLayout({ screenMode: d.screenMode, viewW: d.viewW, scale: d.scale, isVert: d.isVert }, d.finalScale);
    const handleReset = () => setStage(1);

    const handleFlow = (data: { isLogin: boolean }) => {
      console.log("Режим входа/регистрации на Шаге 1:", data.isLogin);
    };

    phaserScene.events.on("phaser_scene_resize", handleResize)
                       .on("phaser_scene_sleep", handleReset)
                       .on("phaser_scene_cleanup", handleReset);

    EventBus.on("set_registration_flow", handleFlow);

    if (phaserScene.sys.isActive()) phaserScene.triggerResize();

    return () => {
      phaserScene.events.off("phaser_scene_resize", handleResize)
                         .off("phaser_scene_sleep", handleReset)
                         .off("phaser_scene_cleanup", handleReset);
      EventBus.off("set_registration_flow", handleFlow);
    };
  }, [phaserScene, setLayout, setStage]);

  if (!ctx) return null;

  const isMob = ctx.screenMode === "mobile" || ctx.screenMode === "fold";
  const transf = `translate(-50%, -50%) scale(${isMob ? 1.2 : 1})`;
  const top = isMob ? "965px" : "910px";

  const handleNext = () => {
    if (!phaserScene.sys.isActive()) return;
    phaserScene.cameras.main.fadeOut(200, 0, 0, 0);
    phaserScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      if (!phaserScene.sys.isActive()) return;
      EventBus.emit("step1_scene_stop"); EventBus.emit("step2_scene_start");
      phaserScene.scene.stop("Step1Scene"); phaserScene.scene.start("Step2Scene", { sessionId: "mock-session-id" });
    });
  };

  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden select-none">
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 box-border flex h-[1080px] w-[1920px] flex-col items-center justify-center [backface-visibility:hidden]" style={{ transform: `translate(-50%, -50%) scale(${finalScale})` }}>
        <PetVideoBlock /> <BubbleBlock />

        {(stage === 1 || stage === 3) && (
          <>
            <div className="pointer-events-none absolute left-1/2 z-20 origin-center" style={{ top: isMob ? "835px" : "810px", transform: transf }}><SpeechInputField /></div>
            <div className="pointer-events-none absolute left-1/2 z-20 origin-center" style={{ top, transform: transf }}><SpeechMicButton /></div>
          </>
        )}

        {stage === 2 && <div className="pointer-events-none absolute top-[865px] left-1/2 z-10 origin-center" style={{ transform: transf }}><ConfirmSelection /></div>}
        {stage === 4 && <div className="pointer-events-none absolute left-1/2 z-10 origin-center" style={{ top, transform: transf }}><NextButton onComplete={handleNext} /></div>}
      </div>
    </div>
  );
}
