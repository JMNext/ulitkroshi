import Phaser from 'phaser';
import React, { createContext, useEffect, useState } from 'react';
import { useRegistrationStep3Store } from "@/Registration/Step_3/store/useRegistrationStep3Store";
import { CaptchaHeaderPanel } from "./components/CaptchaHeaderPanel";
import { CaptchaFruitGrid } from "./components/CaptchaFruitGrid";
import { CaptchaResetButton } from "./components/CaptchaResetButton";
import { CaptchaConfirmModal } from "./components/CaptchaConfirmModal";
import { CaptchaBlockModal } from "./components/CaptchaBlockModal";
import { Step3Scene } from './Step3Scene';

export interface LayoutContext { 
  screenMode: 'fold' | 'mobile' | 'tablet' | 'desktop'; 
  viewW: number; 
  scale: number; 
  isVert: boolean; 
}

interface Step3UiManagerProps {
  phaserScene: Step3Scene;
  sessionId: string;
}

export const ReactLayoutContext = createContext<LayoutContext>({ 
  screenMode: 'desktop', viewW: 1920, scale: 1, isVert: false 
});
export const PhaserGameContext = createContext<Step3Scene | null>(null);

export function Step3UiManager({ phaserScene, sessionId }: Step3UiManagerProps) {
  const { mode, attempts, isLogin } = useRegistrationStep3Store();
  const [layout, setLayout] = useState<{ layoutContext: LayoutContext; computedScale: number } | null>(null);

  useEffect(() => {
    const handleLayoutUpdate = (e: Event) => {
      setLayout((e as CustomEvent).detail);
    };

    window.addEventListener('step3_layout_update', handleLayoutUpdate);
    
    if (phaserScene && phaserScene.sys?.isActive()) {
      phaserScene.triggerResize();
    }

    return () => {
      window.removeEventListener('step3_layout_update', handleLayoutUpdate);
    };
  }, [phaserScene]);

  if (!layout) return null;

  const { layoutContext, computedScale } = layout;
  const showBlockModal = attempts >= 3;

  return (
    <PhaserGameContext.Provider value={phaserScene}>
      <ReactLayoutContext.Provider value={layoutContext}>
        <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden select-none flex items-center justify-center">
          <div 
            className="relative w-[460px] h-[780px] pointer-events-none z-10 flex flex-col items-center justify-center gap-[30px] box-border transition-transform duration-150 [backface-visibility:hidden] origin-center" 
            style={{ transform: `scale(${computedScale})` }}
          >
            <CaptchaHeaderPanel />
            <CaptchaFruitGrid 
              sessionId={sessionId} 
              onSuccess={() => { 
                if (!phaserScene.sys?.isActive()) return; 
                phaserScene.cameras.main.fadeOut(200, 0, 0, 0); 
                phaserScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => 
                  phaserScene.scene.start(isLogin ? "MainScene" : "Step4Scene", { sessionId })
                ); 
              }} 
            />
            <CaptchaResetButton />
            
            {mode === "confirm" && !showBlockModal && <CaptchaConfirmModal />}
            {showBlockModal && <CaptchaBlockModal />}
          </div>
        </div>
      </ReactLayoutContext.Provider>
    </PhaserGameContext.Provider>
  );
}
