import Phaser from 'phaser';
import React, { createContext } from 'react';
import { SuccessBubble } from './components/SuccessBubble';
import { HappyPetVideo } from './components/HappyPetVideo';
import { FinalPlayButton } from './components/FinalPlayButton';
import { Step4Scene } from './Step4Scene';

export interface LayoutContext { 
  screenMode: 'fold' | 'mobile' | 'tablet' | 'desktop'; 
  viewW: number; 
  scale: number; 
  isVert: boolean; 
}

interface Step4UiManagerProps {
  phaserScene: Step4Scene;
  layoutContext: LayoutContext;
  finalScale: number;
}

export const ReactLayoutContext = createContext<LayoutContext>({ 
  screenMode: 'desktop', viewW: 1920, scale: 1, isVert: false 
});
export const PhaserGameContext = createContext<Step4Scene | null>(null);

export function Step4UiManager({ phaserScene, layoutContext, finalScale }: Step4UiManagerProps) {
  const { screenMode } = layoutContext;

  const handlePlayClick = () => {
    if (!phaserScene.sys?.isActive()) return;
    phaserScene.cameras.main.fadeOut(200, 0, 0, 0);
    phaserScene.time.delayedCall(200, () => {
      if (phaserScene.sys?.isActive()) {
        phaserScene.scene.start('MainScene');
      }
    });
  };

  const isMobile = screenMode === 'mobile' || screenMode === 'fold';

  return (
    <PhaserGameContext.Provider value={phaserScene}>
      <ReactLayoutContext.Provider value={layoutContext}>
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
          <div 
            className="absolute left-1/2 top-1/2 w-[1920px] h-[1080px] pointer-events-none z-10 flex flex-col items-center justify-center box-border transition-transform duration-150 [backface-visibility:hidden]" 
            style={{ transform: `translate(-50%, -50%) scale(${finalScale})` }}
          >
            <HappyPetVideo />
            <SuccessBubble />
            <div 
              className="absolute left-1/2 top-[865px] pointer-events-none z-10 origin-center" 
              style={{ transform: `translate(-50%, -50%) scale(${isMobile ? 1.2 : 1})` }}
            >
              <FinalPlayButton onClick={handlePlayClick} />
            </div>
          </div>
        </div>
      </ReactLayoutContext.Provider>
    </PhaserGameContext.Provider>
  );
}
