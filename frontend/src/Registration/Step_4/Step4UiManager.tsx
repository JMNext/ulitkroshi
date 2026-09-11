import { createContext, useEffect } from "react";
import { FinalPlayButton } from "./components/FinalPlayButton";
import { HappyPetVideo } from "./components/HappyPetVideo";
import { SuccessBubble } from "./components/SuccessBubble";
import { Step4Scene } from "./Step4Scene";
import { LayoutContext, useRegistrationStep4Store } from "./store/useRegistrationStep4Store";

interface Step4UiManagerProps {
  phaserScene: Step4Scene;
}

export const ReactLayoutContext = createContext<LayoutContext>({ screenMode: "desktop", viewW: 1920, scale: 1, isVert: false });
export const PhaserGameContext = createContext<Step4Scene | null>(null);

export function Step4UiManager({ phaserScene }: Step4UiManagerProps) {
  const layoutContext = useRegistrationStep4Store((state) => state.layoutContext);
  const finalScale = useRegistrationStep4Store((state) => state.finalScale);

  useEffect(() => {
    if (phaserScene?.sys?.isActive()) phaserScene.triggerResize();
  }, [phaserScene]);

  if (!layoutContext) return null;

  const isMobile = layoutContext.screenMode === "mobile" || layoutContext.screenMode === "fold";

  return (
    <PhaserGameContext.Provider value={phaserScene}>
      <ReactLayoutContext.Provider value={layoutContext}>
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
              <FinalPlayButton
                onClick={() => {
                  if (!phaserScene.sys?.isActive()) return;
                  phaserScene.cameras.main.fadeOut(200, 0, 0, 0);
                  phaserScene.time.delayedCall(200, () => {
                    if (phaserScene.sys?.isActive()) phaserScene.scene.start("MainScene");
                  });
                }}
              />
            </div>
          </div>
        </div>
      </ReactLayoutContext.Provider>
    </PhaserGameContext.Provider>
  );
}
