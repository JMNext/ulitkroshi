import { EventBus } from "@/eventbus/EventBus";
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { BackButton } from "@/shared/components/BackButton";
import Phaser from "phaser";
import { useEffect, useState } from "react";
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

export function Step3UiManager({ phaserScene, sessionId }: Step3UiManagerProps) {
  const { isLogin, loginMode, loginAttempts, step3Mode, registerAttempts, layoutContext } = useRegistrationStep3Store();

  const setLayout = useRegistrationStep3Store((state) => state.setLayout);
  const resetStore = useRegistrationStep3Store((state) => state.resetStore);

  const [dynamicScale, setDynamicScale] = useState(1);

  const activeSessionId = sessionId || localStorage.getItem("active_reg_session_id") || "direct_login_session";
  const currentMode = isLogin ? loginMode : step3Mode;
  const currentAttempts = isLogin ? loginAttempts : registerAttempts;

  useEffect(() => {
    const calculateSafeScale = () => {
      if (typeof window === "undefined") return;

      const baseWidth = 460;
      const baseHeight = 780;

      const maxAllowedW = window.innerWidth * 0.9;
      const maxAllowedH = window.innerHeight * 0.9;

      const scaleW = maxAllowedW / baseWidth;
      const scaleH = maxAllowedH / baseHeight;
      const safeScale = Math.min(scaleW, scaleH);

      setDynamicScale(Math.max(0.45, Math.min(safeScale, 1.4)));
    };

    const handleResize = (data: {
      width: number;
      height: number;
      isVert: boolean;
      scale: number;
      viewW: number;
      screenMode: "fold" | "mobile" | "tablet" | "desktop";
    }) => {
      const { screenMode, viewW, scale, isVert } = data;
      setLayout({ screenMode, viewW, scale: scale, isVert }, scale);
      calculateSafeScale();
    };

    const handleSceneInit = () => {
      const currentIsLogin = useRegistrationStep3Store.getState().isLogin;

      if (currentIsLogin) {
        useRegistrationStep3Store.setState({
          loginSel: [],
          loginMode: "select",
          loginError: ""
        });
      } else {
        useRegistrationStep3Store.setState({
          step3Mode: "select",
          registerSel: [],
          registerCorr: [],
          step3Error: ""
        });
      }
      calculateSafeScale();
    };

    const handleReset = () => {
      resetStore(true, true);
    };

    const handleFlow = (data: { isLogin: boolean }) => {
      useRegistrationStep3Store.getState().setIsLogin(data.isLogin);
    };

    window.addEventListener("resize", calculateSafeScale);
    phaserScene.events.on("phaser_scene_resize", handleResize);
    phaserScene.events.on("phaser_scene_init", handleSceneInit);
    phaserScene.events.on("phaser_scene_sleep", handleReset);
    phaserScene.events.on("phaser_scene_cleanup", handleReset);

    EventBus.on("set_registration_flow", handleFlow);

    if (phaserScene.sys.isActive()) {
      handleSceneInit();
      phaserScene.triggerResize();
    }

    return () => {
      window.removeEventListener("resize", calculateSafeScale);
      phaserScene.events.off("phaser_scene_resize", handleResize);
      phaserScene.events.off("phaser_scene_init", handleSceneInit);
      phaserScene.events.off("phaser_scene_sleep", handleReset);
      phaserScene.events.off("phaser_scene_cleanup", handleReset);
      EventBus.off("set_registration_flow", handleFlow);
    };
  }, [phaserScene, setLayout, resetStore]);

  const handleSuccess = () => {
    if (!phaserScene.sys.isActive()) return;

    phaserScene.cameras.main.fadeOut(200, 0, 0, 0);
    phaserScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      if (!phaserScene.sys.isActive()) return;

      const savedIsLoginFlow = isLogin || (typeof window !== "undefined" && localStorage.getItem("is_login_flow") === "true");

      resetStore(true, true);

      EventBus.emit("step3_scene_stop");

      const targetSceneKey = savedIsLoginFlow ? "MainScene" : "Step4Scene";

      EventBus.emit(savedIsLoginFlow ? "main_scene_start" : "step4_scene_start", { sessionId: activeSessionId });

      phaserScene.scene.stop("Step3Scene");
      phaserScene.scene.start(targetSceneKey, { sessionId: activeSessionId });
    });
  };

  const handleBack = () => {
    if (!phaserScene.sys.isActive()) return;

    phaserScene.cameras.main.fadeOut(200, 0, 0, 0);
    phaserScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      if (!phaserScene.sys.isActive()) return;
      const currentIsLogin = isLogin;
      resetStore(true, true);
      EventBus.emit("step3_scene_stop");
      EventBus.emit("step2_scene_start");
      phaserScene.scene.stop("Step3Scene");
      phaserScene.scene.start("Step2Scene", { isLoginFlow: currentIsLogin });
    });
  };

  if (!layoutContext) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden select-none">
      {/* Кнопка возврата в верхнем левом углу экрана */}
      <div
        className="pointer-events-auto absolute z-50"
        style={{
          top: "max(16px, env(safe-area-inset-top, 16px))",
          left: "max(16px, env(safe-area-inset-left, 16px))",
        }}
      >
        <BackButton onClick={handleBack} label="Назад" />
      </div>

      <div
        className="pointer-events-none relative z-10 box-border flex h-[780px] w-[460px] origin-center flex-col items-center justify-center gap-[30px] opacity-100 transition-opacity [backface-visibility:hidden]"
        style={{ transform: `scale(${dynamicScale})` }}
      >
        <CaptchaHeaderPanel />
        <CaptchaFruitGrid sessionId={activeSessionId} onSuccess={handleSuccess} />
        <CaptchaResetButton />

        {currentMode === "confirm" && currentAttempts < 3 && <CaptchaConfirmModal />}
        {currentAttempts >= 3 && <CaptchaBlockModal />}
      </div>
    </div>
  );
}
