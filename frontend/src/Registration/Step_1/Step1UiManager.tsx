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

interface Step1UiManagerProps {
  phaserScene: Step1Scene;
}

interface CustomWindow extends Window {
  phaserGame: Phaser.Game | null;
}

export function Step1UiManager({ phaserScene }: Step1UiManagerProps) {
  const stage = useRegistrationStep1Store((state) => state.stage);
  const layoutContext = useRegistrationStep1Store((state) => state.layoutContext);
  const finalScale = useRegistrationStep1Store((state) => state.finalScale);

  useEffect(() => {
    if (phaserScene.sys.isActive()) {
      phaserScene.triggerResize();
    }
    return () => {
      useRegistrationStep1Store.getState().setStage(1);
    };
  }, [phaserScene]);

  if (!layoutContext) return null;

  const isMobile = layoutContext.screenMode === "mobile" || layoutContext.screenMode === "fold";
  const sharedTransform = `translate(-50%, -50%) scale(${isMobile ? 1.2 : 1})`;
  const sharedTop = isMobile ? "965px" : "910px";

  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden select-none">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 z-10 box-border flex h-[1080px] w-[1920px] flex-col items-center justify-center [backface-visibility:hidden]"
        style={{ transform: `translate(-50%, -50%) scale(${finalScale})` }}
      >
        <PetVideoBlock />
        <BubbleBlock />

        {(stage === 1 || stage === 3) && (
          <>
            <div
              className="pointer-events-none absolute left-1/2 z-20 origin-center"
              style={{ top: isMobile ? "835px" : "810px", transform: sharedTransform }}
            >
              <SpeechInputField />
            </div>
            <div
              className="pointer-events-none absolute left-1/2 z-20 origin-center"
              style={{ top: sharedTop, transform: sharedTransform }}
            >
              <SpeechMicButton />
            </div>
          </>
        )}

        {stage === 2 && (
          <div className="pointer-events-none absolute top-[865px] left-1/2 z-10 origin-center" style={{ transform: sharedTransform }}>
            <ConfirmSelection />
          </div>
        )}

        {stage === 4 && (
          <div className="pointer-events-none absolute left-1/2 z-10 origin-center" style={{ top: sharedTop, transform: sharedTransform }}>
            <NextButton
              onComplete={() => {
                if (!phaserScene.sys.isActive()) return;
                phaserScene.cameras.main.fadeOut(200, 0, 0, 0);
                phaserScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                  EventBus.emit("step1_scene_stop");
                  EventBus.emit("step2_scene_start");

                  if (typeof window !== "undefined") {
                    const customWindow = window as unknown as CustomWindow;
                    const game = customWindow.phaserGame;
                    if (game) {
                      game.scene.stop("Step1Scene");
                      game.scene.start("Step2Scene");
                    }
                  }
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
