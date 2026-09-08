import Phaser from 'phaser';
import React, { createContext } from 'react';
import { useRegistrationStep2Store } from "@/Registration/Step_2/store/useRegistrationStep2Store";
import { HeaderBlock } from "./components/HeaderBlock";
import { DisplayFields } from "./components/DisplayFields";
import { SubmitButton } from "./components/SubmitButton";
import { PinPad } from "./components/PinPad";
import { SentModal } from "./components/SentModal";
import { Step2Scene } from './Step2Scene';

export interface LayoutContext { 
  screenMode: 'fold' | 'mobile' | 'tablet' | 'desktop'; 
  viewW: number; 
  scale: number; 
  isVert: boolean; 
}

interface Step2UiManagerProps {
  phaserScene: Step2Scene;
  layoutContext: LayoutContext;
  computedScale: number;
}

export const ReactLayoutContext = createContext<LayoutContext>({ 
  screenMode: 'desktop', viewW: 1920, scale: 1, isVert: false 
});
export const PhaserGameContext = createContext<Step2Scene | null>(null);

export function Step2UiManager({ phaserScene, layoutContext, computedScale }: Step2UiManagerProps) {
  const storeMode = useRegistrationStep2Store((state) => state.mode);
  const { isVert } = layoutContext;

  return (
    <PhaserGameContext.Provider value={phaserScene}>
      <ReactLayoutContext.Provider value={layoutContext}>
        <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden select-none flex items-center justify-center">
          <div 
            className="relative pointer-events-none z-10 flex flex-col items-center justify-center gap-[30px] box-border transition-transform duration-150 [backface-visibility:hidden] origin-center" 
            style={{ transform: `scale(${computedScale})`, width: "460px", height: isVert ? "780px" : "840px" }}
          >
            <HeaderBlock />
            <DisplayFields />
            {storeMode === "phone" && <SubmitButton />}
            <PinPad onSuccess={(sessionId) => { if (!phaserScene.sys?.isActive()) return; phaserScene.cameras.main.fadeOut(200, 0, 0, 0); phaserScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => phaserScene.scene.start("Step3Scene", { sessionId })); }} />
            {storeMode === "sent" && <SentModal />}
          </div>
        </div>
      </ReactLayoutContext.Provider>
    </PhaserGameContext.Provider>
  );
}
