import { EventBus } from "@/eventbus/EventBus";
import { useEffect } from "react";
import Phaser from "phaser";
import { FinalPlayButton } from "./components/FinalPlayButton";
import { HappyPetVideo } from "./components/HappyPetVideo";
import { SuccessBubble } from "./components/SuccessBubble";
import { Step4Scene } from "./Step4Scene";
import { useRegistrationStep4Store } from "./store/useRegistrationStep4Store";

interface Step4UiManagerProps {
  phaserScene: Step4Scene;
}

interface CustomWindow extends Window {
  phaserGame: Phaser.Game | null;
}

export function Step4UiManager({ phaserScene }: Step4UiManagerProps) {
  const layoutContext = useRegistrationStep4Store((state) => state.layoutContext);
  const finalScale = useRegistrationStep4Store((state) => state.finalScale);

  useEffect(() => {
    if (phaserScene.sys.isActive()) {
      phaserScene.triggerResize();
    }
  }, [phaserScene]);

  if (!layoutContext) return null;

  const isMobile = layoutContext.screenMode === "mobile" || layoutContext.screenMode === "fold";

  const handlePlayClick = () => {
    if (!phaserScene.sys.isActive()) return;

    phaserScene.cameras.main.fadeOut(200, 0, 0, 0);
    phaserScene.time.delayedCall(200, () => {
      if (!phaserScene.sys.isActive()) return;

      EventBus.emit("step4_scene_stop");
      EventBus.emit("main_scene_start");

      if (typeof window !== "undefined") {
        const customWindow = window as unknown as CustomWindow;
        const game = customWindow.phaserGame;
        if (game) {
          game.scene.stop("Step4Scene");
          game.scene.start("MainScene");
        }
      }
    });
  };

  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden select-none">
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 z-10 box-border flex h-[1080px] w-[1920px] flex-col items-center justify-center opacity-100 transition-opacity [backface-visibility:hidden]"
        style={{ transform: `translate(-50%, -50%) scale(${finalScale})` }}
      >
        <HappyPetVideo />
        <SuccessBubble />

        <div
          className="pointer-events-none absolute top-[865px] left-1/2 z-10 origin-center"
          style={{ transform: `translate(-50%, -50%) scale(${isMobile ? 1.2 : 1})` }}
        >
          <FinalPlayButton onClick={handlePlayClick} />
        </div>
      </div>
    </div>
  );
}
