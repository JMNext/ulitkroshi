import { EventBus } from "@/eventbus/EventBus";
import { useRegistrationStep2Store } from "@/Registration/Step_2/store/useRegistrationStep2Store";
import { BackButton } from "@/shared/components/BackButton";
import { clsx } from "clsx";
import Phaser from "phaser";
import { createContext, useEffect, useState } from "react";
import { DisplayFields } from "./components/DisplayFields";
import { HeaderBlock } from "./components/HeaderBlock";
import { PhoneExistsModal } from "./components/PhoneExistsModal";
import { PinPad } from "./components/PinPad";
import { SmsSentModal } from "./components/SmsSentModal";
import { SubmitButton } from "./components/SubmitButton";
import { UserNotFoundModal } from "./components/UserNotFoundModal";
import { Step2Scene } from "./Step2Scene";

export const PhaserGameContext = createContext<Step2Scene | null>(null);

export function Step2UiManager({ phaserScene }: { phaserScene: Step2Scene }) {
  const {
    isLogin,
    registerMode,
    layoutContext: ctx,
    setLayout,
    clearErrors,
    checkSavedDevicePhone,
    resetStore,
    setRegisterMode,
  } = useRegistrationStep2Store();

  const mode = isLogin ? "phone" : registerMode;
  const [dynamicScale, setDynamicScale] = useState(1);

  useEffect(() => {
    const calculateSafeScale = () => {
      if (typeof window === "undefined") return;

      const baseWidth = 460;
      const baseHeight = 840;

      const maxAllowedW = window.innerWidth * 0.9;
      const maxAllowedH = window.innerHeight * 0.9;

      const scaleW = maxAllowedW / baseWidth;
      const scaleH = maxAllowedH / baseHeight;
      const safeScale = Math.min(scaleW, scaleH);

      setDynamicScale(Math.max(0.45, Math.min(safeScale, 1.4)));
    };

    const handleResize = (d: any) => {
      setLayout({ screenMode: d.screenMode, viewW: d.viewW, scale: d.scale, isVert: d.isVert }, d.scale);
      calculateSafeScale();
    };

    const handleReady = (data?: { isLoginFlow?: boolean }) => {
      clearErrors();
      if (data) {
        useRegistrationStep2Store.getState().setIsLogin(!!data.isLoginFlow);
      }
      checkSavedDevicePhone(() => phaserScene.sys.isActive() && phaserScene.triggerResize());
      calculateSafeScale();
    };

    const handleReset = () => resetStore();

    window.addEventListener("resize", calculateSafeScale);
    phaserScene.events
      .on("phaser_scene_resize", handleResize)
      .on("phaser_scene_ready", handleReady)
      .on("phaser_scene_sleep", handleReset)
      .on("phaser_scene_cleanup", handleReset);

    if (phaserScene.sys.isActive()) {
      handleReady({ isLoginFlow: phaserScene.isLoginFlow });
      phaserScene.triggerResize();
    }

    return () => {
      window.removeEventListener("resize", calculateSafeScale);
      phaserScene.events
        .off("phaser_scene_resize", handleResize)
        .off("phaser_scene_ready" as any, handleReady)
        .off("phaser_scene_sleep", handleReset)
        .off("phaser_scene_cleanup", handleReset);
    };
  }, [phaserScene, setLayout, clearErrors, checkSavedDevicePhone, resetStore]);

  const handleBack = () => {
    if (!phaserScene.sys.isActive()) return;

    const state = useRegistrationStep2Store.getState();

    // Если находимся на этапе ввода СМС-кода — возвращаемся к редактированию номера телефона
    if (!state.isLogin && state.registerMode === "code") {
      state.setRegisterMode("phone");
      state.clearErrors();
      return;
    }

    phaserScene.cameras.main.fadeOut(200, 0, 0, 0);
    phaserScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      if (!phaserScene.sys.isActive()) return;
      EventBus.emit("step2_scene_stop");
      resetStore();

      if (state.isLogin) {
        // Режим входа: возвращаемся на начальный экран с выбором Войти / Зарегистрироваться
        EventBus.emit("login_scene_start");
        phaserScene.scene.stop("Step2Scene");
        phaserScene.scene.start("LoginScene");
      } else {
        // Режим регистрации: возвращаемся на Шаг 1 (ввод имени)
        EventBus.emit("step1_scene_start");
        phaserScene.scene.stop("Step2Scene");
        phaserScene.scene.start("Step1Scene");
      }
    });
  };

  return ctx ? (
    <PhaserGameContext.Provider value={phaserScene}>
      <div className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden select-none">
        {/* Кнопка возврата в верхнем левом углу экрана */}
        <div
          className="pointer-events-auto absolute z-50"
          style={{
            top: "max(16px, env(safe-area-inset-top, 16px))",
            left: "max(16px, env(safe-area-inset-left, 16px))",
          }}
        >
          <BackButton onClick={handleBack} label={isLogin ? "В начало" : "Назад"} />
        </div>

        <div
          className={clsx(
            "pointer-events-none relative z-10 box-border flex w-[460px] origin-center flex-col items-center justify-center gap-[30px] [backface-visibility:hidden]",
            ctx.isVert ? "h-[780px]" : "h-[840px]"
          )}
          style={{ transform: `scale(${dynamicScale})` }}
        >
          <HeaderBlock />
          <DisplayFields />
          {mode === "phone" && !isLogin && <SubmitButton />}
          <PinPad />
          {mode === "sent" && (isLogin ? <UserNotFoundModal /> : <SmsSentModal />)}
          {mode === "exists" && !isLogin && <PhoneExistsModal />}
        </div>
      </div>
    </PhaserGameContext.Provider>
  ) : null;
}
