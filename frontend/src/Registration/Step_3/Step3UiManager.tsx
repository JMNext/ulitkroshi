import { EventBus } from "@/eventbus/EventBus";
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import Phaser from "phaser";
import { useEffect } from "react";
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

interface CustomWindow extends Window {
  phaserGame: Phaser.Game | null;
}

export function Step3UiManager({ phaserScene, sessionId }: Step3UiManagerProps) {
  const {
    isLogin,
    loginMode,
    loginAttempts,
    registerMode,
    registerAttempts,
    layoutContext,
    computedScale
  } = useRegistrationStep3Store();

  const currentMode = isLogin ? loginMode : registerMode;
  const currentAttempts = isLogin ? loginAttempts : registerAttempts;

  useEffect(() => {
    if (phaserScene.sys.isActive()) {
      phaserScene.triggerResize();
    }
  }, [phaserScene]);

  if (!layoutContext) return null;

  const activeSessionId = sessionId || localStorage.getItem("active_reg_session_id") || "direct_login_session";

  return (
    <div className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden select-none">
      <div
        className="pointer-events-none relative z-10 box-border flex h-[780px] w-[460px] origin-center flex-col items-center justify-center gap-[30px] opacity-100 transition-opacity [backface-visibility:hidden]"
        style={{ transform: `scale(${computedScale})` }}
      >
        <CaptchaHeaderPanel />
        <CaptchaFruitGrid
          sessionId={activeSessionId}
          onSuccess={() => {
            if (!phaserScene.sys.isActive()) return;
            phaserScene.cameras.main.fadeOut(200, 0, 0, 0);
            phaserScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
              useRegistrationStep3Store.getState().resetStore(true, true);

              EventBus.emit("step3_scene_stop");

              const targetScene = isLogin ? "MainScene" : "Step4Scene";
              EventBus.emit(isLogin ? "main_scene_start" : "step4_scene_start", { sessionId: activeSessionId });

              if (typeof window !== "undefined") {
                const customWindow = window as unknown as CustomWindow;
                const game = customWindow.phaserGame;
                if (game) {
                  game.scene.stop("Step3Scene");
                  game.scene.start(targetScene, { sessionId: activeSessionId });
                }
              }
            });
          }}
        />
        <CaptchaResetButton />

        {currentMode === "confirm" && currentAttempts < 3 && <CaptchaConfirmModal />}
        {currentAttempts >= 3 && <CaptchaBlockModal />}
      </div>
    </div>
  );
}
