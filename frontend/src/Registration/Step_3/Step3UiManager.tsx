import { LayoutContext, useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import Phaser from "phaser";
import { createContext, useEffect } from "react";
import { CaptchaBlockModal } from "./components/CaptchaBlockModal";
import { CaptchaConfirmModal } from "./components/CaptchaConfirmModal";
import { CaptchaFruitGrid } from "./components/CaptchaFruitGrid";
import { CaptchaHeaderPanel } from "./components/CaptchaHeaderPanel";
import { CaptchaResetButton } from "./components/CaptchaResetButton";
import { Step3Scene } from "./Step3Scene";

interface Step3UiManagerProps {
  phaserScene: Step3Scene;
  sessionId: string;
}

export const ReactLayoutContext = createContext<LayoutContext>({ screenMode: "desktop", viewW: 1920, scale: 1, isVert: false });
export const PhaserGameContext = createContext<Step3Scene | null>(null);

export function Step3UiManager({ phaserScene, sessionId }: Step3UiManagerProps) {
  const { mode, attempts, isLogin, layoutContext, computedScale } = useRegistrationStep3Store();

  useEffect(() => {
    if (phaserScene?.sys?.isActive()) phaserScene.triggerResize();
  }, [phaserScene]);

  if (!layoutContext) return null;

  const activeSessionId = sessionId || localStorage.getItem("active_reg_session_id") || "direct_login_session";

  return (
    <PhaserGameContext.Provider value={phaserScene}>
      <ReactLayoutContext.Provider value={layoutContext}>
        <div className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden select-none">
          <div
            className="pointer-events-none relative z-10 box-border flex h-[780px] w-[460px] origin-center flex-col items-center justify-center gap-[30px] opacity-100 transition-opacity [backface-visibility:hidden]"
            style={{ transform: `scale(${computedScale})` }}
          >
            <CaptchaHeaderPanel />
            <CaptchaFruitGrid
              sessionId={activeSessionId}
              onSuccess={() => {
                if (!phaserScene.sys?.isActive()) return;
                phaserScene.cameras.main.fadeOut(200, 0, 0, 0);
                phaserScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                  localStorage.removeItem("active_reg_session_id");
                  useRegistrationStep3Store.getState().resetStore(false, true);
                  phaserScene.scene.start(isLogin ? "MainScene" : "Step4Scene", { sessionId: activeSessionId });
                });
              }}
            />
            <CaptchaResetButton />

            {mode === "confirm" && attempts < 3 && <CaptchaConfirmModal />}
            {attempts >= 3 && <CaptchaBlockModal />}
          </div>
        </div>
      </ReactLayoutContext.Provider>
    </PhaserGameContext.Provider>
  );
}
