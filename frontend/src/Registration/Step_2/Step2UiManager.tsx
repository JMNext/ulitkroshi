import { EventBus } from "@/eventbus/EventBus";
import { useRegistrationStep2Store } from "@/Registration/Step_2/store/useRegistrationStep2Store";
import { clsx } from "clsx";
import { createContext, useEffect } from "react";
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
  const { isLogin, loginError, registerMode, layoutContext: ctx, computedScale: scale, setLayout, clearErrors, checkSavedDevicePhone, resetStore } = useRegistrationStep2Store();
  const mode = isLogin ? (loginError === "user_not_found" ? "sent" : "phone") : registerMode;

  useEffect(() => {
    const handleResize = (d: any) => setLayout({ screenMode: d.screenMode, viewW: d.viewW, scale: d.scale, isVert: d.isVert }, d.scale);
    const handleReady = () => { clearErrors(); checkSavedDevicePhone(() => phaserScene.sys.isActive() && phaserScene.triggerResize()); };
    const handleReset = () => resetStore();

    const handleFlow = (data: { isLogin: boolean }) => {
      useRegistrationStep2Store.getState().setIsLogin(data.isLogin);
    };

    phaserScene.events.on("phaser_scene_resize", handleResize).on("phaser_scene_ready", handleReady)
                       .on("phaser_scene_sleep", handleReset).on("phaser_scene_cleanup", handleReset);

    EventBus.on("set_registration_flow", handleFlow);

    if (phaserScene.sys.isActive()) { handleReady(); phaserScene.triggerResize(); }

    return () => {
      phaserScene.events.off("phaser_scene_resize", handleResize).off("phaser_ready" as any, handleReady)
                         .off("phaser_scene_sleep", handleReset).off("phaser_scene_cleanup", handleReset);
      EventBus.off("set_registration_flow", handleFlow);
    };
  }, [phaserScene, setLayout, clearErrors, checkSavedDevicePhone, resetStore]);

  return ctx ? (
    <PhaserGameContext.Provider value={phaserScene}>
      <div className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden select-none">
        <div className={clsx("pointer-events-none relative z-10 box-border flex w-[460px] origin-center flex-col items-center justify-center gap-[30px] [backface-visibility:hidden]", ctx.isVert ? "h-[780px]" : "h-[840px]")} style={{ transform: `scale(${scale})` }}>
          <HeaderBlock /> <DisplayFields />
          {mode === "phone" && !isLogin && <SubmitButton />}
          <PinPad />
          {mode === "sent" && (isLogin ? <UserNotFoundModal /> : <SmsSentModal />)}
          {mode === "exists" && !isLogin && <PhoneExistsModal />}
        </div>
      </div>
    </PhaserGameContext.Provider>
  ) : null;
}
