import { useRegistrationStep2Store } from "@/Registration/Step_2/store/useRegistrationStep2Store";
import { clsx } from "clsx";
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
  const { isLogin, loginError, registerMode, layoutContext: ctx, setLayout, clearErrors, checkSavedDevicePhone, resetStore } = useRegistrationStep2Store();
  const mode = isLogin ? (loginError === "user_not_found" ? "sent" : "phone") : registerMode;

  const [dynamicScale, setDynamicScale] = useState(1);

  useEffect(() => {
    const calculateSafeScale = () => {
      if (typeof window === "undefined") return;

      const currentIsVert = window.innerHeight > window.innerWidth;

      // Базовые габариты контента (целевой контейнер с кнопками и отступами)
      const baseWidth = 460;
      const baseHeight = currentIsVert ? 780 : 840;

      // Берем 90% от ширины и высоты экрана, оставляя 5% отступов безопасности с каждой стороны
      const maxAllowedW = window.innerWidth * 0.9;
      const maxAllowedH = window.innerHeight * 0.9;

      // Выбираем строгий ограничитель, который не даст вылезти ни по одной из сторон
      const scaleW = maxAllowedW / baseWidth;
      const scaleH = maxAllowedH / baseHeight;
      const safeScale = Math.min(scaleW, scaleH);

      // Зажимаем масштаб в разумных пределах, чтобы на огромных экранах интерфейс не становился гигантским
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
    phaserScene.events.on("phaser_scene_resize", handleResize).on("phaser_scene_ready", handleReady)
                       .on("phaser_scene_sleep", handleReset).on("phaser_scene_cleanup", handleReset);

    if (phaserScene.sys.isActive()) {
      handleReady({ isLoginFlow: phaserScene.isLoginFlow });
      phaserScene.triggerResize();
    }

    return () => {
      window.removeEventListener("resize", calculateSafeScale);
      phaserScene.events.off("phaser_scene_resize", handleResize).off("phaser_scene_ready" as any, handleReady)
                         .off("phaser_scene_sleep", handleReset).off("phaser_scene_cleanup", handleReset);
    };
  }, [phaserScene, setLayout, clearErrors, checkSavedDevicePhone, resetStore]);

  return ctx ? (
    <PhaserGameContext.Provider value={phaserScene}>
      <div className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden select-none">
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
