import { LayoutContext, useRegistrationStep2Store } from "@/Registration/Step_2/store/useRegistrationStep2Store";
import { createContext, useEffect } from "react";
import { DisplayFields } from "./components/DisplayFields";
import { HeaderBlock } from "./components/HeaderBlock";
import { PinPad } from "./components/PinPad";
import { SentModal } from "./components/SentModal";
import { SubmitButton } from "./components/SubmitButton";
import { Step2Scene } from "./Step2Scene";

interface Step2UiManagerProps {
  phaserScene: Step2Scene;
}

export const ReactLayoutContext = createContext<LayoutContext>({ screenMode: "desktop", viewW: 1920, scale: 1, isVert: false });
export const PhaserGameContext = createContext<Step2Scene | null>(null);

export function Step2UiManager({ phaserScene }: Step2UiManagerProps) {
  const storeMode = useRegistrationStep2Store((state) => state.mode);
  const isLogin = useRegistrationStep2Store((state) => state.isLogin);
  const layoutContext = useRegistrationStep2Store((state) => state.layoutContext);
  const computedScale = useRegistrationStep2Store((state) => state.computedScale);

  useEffect(() => {
    if (phaserScene?.sys?.isActive()) phaserScene.triggerResize();
  }, [phaserScene]);

  if (!layoutContext) return null;

  return (
    <PhaserGameContext.Provider value={phaserScene}>
      <ReactLayoutContext.Provider value={layoutContext}>
        <div className="pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden select-none">
          <div
            className="pointer-events-none relative z-10 box-border flex origin-center flex-col items-center justify-center gap-[30px] opacity-100 [backface-visibility:hidden]"
            style={{ transform: `scale(${computedScale})`, width: "460px", height: layoutContext.isVert ? "780px" : "840px" }}
          >
            <HeaderBlock />
            <DisplayFields />
            {storeMode === "phone" && !isLogin && <SubmitButton />}
            <PinPad />
            {storeMode === "sent" && <SentModal />}
          </div>
        </div>
      </ReactLayoutContext.Provider>
    </PhaserGameContext.Provider>
  );
}
