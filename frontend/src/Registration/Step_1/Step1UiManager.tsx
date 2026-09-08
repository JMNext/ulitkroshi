import Phaser from 'phaser';
import React, { createContext, useEffect, useState } from 'react';
import { useRegistrationStep1Store } from "@/Registration/Step_1/store/useRegistrationStep1Store";
import { BubbleBlock } from "./components/BubbleBlock";
import { PetVideoBlock } from "./components/PetVideoBlock";
import { SpeechInputField } from "./components/SpeechInputField";
import { SpeechMicButton } from "./components/SpeechMicButton";
import { ConfirmSelection } from "./components/ConfirmSelection";
import { NextButton } from "./components/NextButton";
import { Step1Scene } from './Step1Scene';

export interface LayoutContext { 
  screenMode: 'fold' | 'mobile' | 'tablet' | 'desktop'; 
  viewW: number; 
  scale: number; 
  isVert: boolean; 
}

interface Step1UiManagerProps {
  phaserScene: Step1Scene;
}

export const ReactLayoutContext = createContext<LayoutContext>({ 
  screenMode: 'desktop', viewW: 1920, scale: 1, isVert: false 
});
export const PhaserGameContext = createContext<Step1Scene | null>(null);

export function Step1UiManager({ phaserScene }: Step1UiManagerProps) {
  const stage = useRegistrationStep1Store((state) => state.stage);
  const [layout, setLayout] = useState<{ layoutContext: LayoutContext; finalScale: number } | null>(null);

  useEffect(() => {
    const handleLayoutUpdate = (e: Event) => {
      setLayout((e as CustomEvent).detail);
    };

    window.addEventListener('step1_layout_update', handleLayoutUpdate);
    
    if (phaserScene && phaserScene.sys?.isActive()) {
      phaserScene.triggerResize();
    }

    return () => {
      window.removeEventListener('step1_layout_update', handleLayoutUpdate);
      useRegistrationStep1Store.getState().setStage(1);
    };
  }, [phaserScene]);

  if (!layout) return null;

  const { layoutContext, finalScale } = layout;
  const { screenMode } = layoutContext;
  const isMobile = screenMode === 'mobile' || screenMode === 'fold';
  const bonusScale = isMobile ? 1.2 : 1;
  const sharedTop = isMobile ? "965px" : "910px";
  const sharedTransform = `translate(-50%, -50%) scale(${bonusScale})`;

  return (
    <PhaserGameContext.Provider value={phaserScene}>
      <ReactLayoutContext.Provider value={layoutContext}>
        <div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden select-none">
          <div 
            className="absolute left-1/2 top-1/2 w-[1920px] h-[1080px] pointer-events-none z-10 flex flex-col items-center justify-center box-border transition-transform duration-150 [backface-visibility:hidden]" 
            style={{ transform: `translate(-50%, -50%) scale(${finalScale})` }}
          >
            <PetVideoBlock />
            <BubbleBlock />
            {(stage === 1 || stage === 3) && (
              <>
                <div className="absolute left-1/2 pointer-events-none z-20 origin-center" style={{ top: isMobile ? "835px" : "810px", transform: sharedTransform }}><SpeechInputField /></div>
                <div className="absolute left-1/2 pointer-events-none z-20 origin-center" style={{ top: sharedTop, transform: sharedTransform }}><SpeechMicButton /></div>
              </>
            )}
            {stage === 2 && <div className="absolute left-1/2 top-[865px] pointer-events-none z-10 origin-center" style={{ transform: sharedTransform }}><ConfirmSelection /></div>}
            {stage === 4 && (
              <div className="absolute left-1/2 pointer-events-none z-10 origin-center" style={{ top: sharedTop, transform: sharedTransform }}>
                <NextButton onComplete={() => { if (!phaserScene.sys?.isActive()) return; phaserScene.cameras.main.fadeOut(200, 0, 0, 0); phaserScene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => phaserScene.scene.start("Step2Scene")); }} />
              </div>
            )}
          </div>
        </div>
      </ReactLayoutContext.Provider>
    </PhaserGameContext.Provider>
  );
}
