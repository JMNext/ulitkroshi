import { useRegistrationStep2Store } from "@/Registration/Step_2/store/useRegistrationStep2Store";
import { clsx } from "clsx";
import { createContext, useEffect } from "react";
import { DisplayFields } from "./components/DisplayFields";
import { HeaderBlock } from "./components/HeaderBlock";
import { PinPad } from "./components/PinPad";
import { UserNotFoundModal } from "./components/UserNotFoundModal";
import { SmsSentModal } from "./components/SmsSentModal";
import { SubmitButton } from "./components/SubmitButton";
import { Step2Scene } from "./Step2Scene";

interface Step2UiManagerProps {
  phaserScene: Step2Scene;
}

export const PhaserGameContext = createContext<Step2Scene | null>(null);

export function Step2UiManager({ phaserScene }: Step2UiManagerProps) {
  const isLogin = useRegistrationStep2Store((state) => state.isLogin);
  const loginError = useRegistrationStep2Store((state) => state.loginError);
  const registerMode = useRegistrationStep2Store((state) => state.registerMode);
  const layoutContext = useRegistrationStep2Store((state) => state.layoutContext);
  const computedScale = useRegistrationStep2Store((state) => state.computedScale);

  const currentMode = isLogin ? (loginError === "user_not_found" ? "sent" : "phone") : registerMode;

  useEffect(() => {
    if (phaserScene.sys.isActive()) {
      phaserScene.triggerResize();
    }
  }, [phaserScene]);

  if (!layoutContext) return null;

  return (
    <PhaserGameContext.Provider value={phaserScene}>
      <div className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden select-none">
        <div
          className={clsx(
            "pointer-events-none relative z-10 box-border flex w-[460px] origin-center flex-col items-center justify-center gap-[30px] opacity-100 [backface-visibility:hidden]",
            layoutContext.isVert ? "h-[780px]" : "h-[840px]"
          )}
          style={{ transform: `scale(${computedScale})` }}
        >
          <HeaderBlock />
          <DisplayFields />
          {currentMode === "phone" && !isLogin && <SubmitButton />}
          <PinPad />
          {currentMode === "sent" && isLogin && <UserNotFoundModal />}
          {currentMode === "sent" && !isLogin && <SmsSentModal />}
        </div>
      </div>
    </PhaserGameContext.Provider>
  );
}
