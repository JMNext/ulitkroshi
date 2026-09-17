import { BottomMenu } from "@/MainScene/components/BottomMenu/BottomMenu";
import { FoodPanel } from "@/MainScene/components/FoodPanel/FoodPanel";
import { Header } from "@/MainScene/components/Header/Header";
import { HelpModal } from "@/MainScene/components/HelpModal/HelpModal";
import { PetCharacter } from "@/MainScene/components/PetCharacter/PetCharacter";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { SideButtonsMenu } from "@/MainScene/components/SideButtonsMenu/SideButtonsMenu";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import NiceModal from "@ebay/nice-modal-react";
import React, { useEffect } from "react";

export const MainSceneUI = () => {
  const { alertText, width, height, finalScale, styles, isFoodOpen, setIsFoodOpen } = useMainGameStore();

  useEffect(() => {
    NiceModal.show(HelpModal);
  }, []);

  if (!width || !height || !styles) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-hidden font-black select-none">
      <div
        className="pointer-events-none absolute box-border flex flex-col items-center justify-center opacity-100 transition-opacity [backface-visibility:hidden] top-1/2 left-1/2 h-[1080px] w-[1920px]"
        style={{ transform: `translate(-50%, -50%) scale(${finalScale})` }}
      >
        <Header styles={styles.header} />

        <PetCharacter
          styles={styles.pet}
          alertText={alertText}
          onAnimationEnd={(key) => {
            usePetStore.getState().completeCareAction();
            window.phaserGame?.scene.getScene("MainScene")?.events.emit("pet_animation_complete", key);
          }}
        />

        <SideButtonsMenu side="left" styles={styles.sideLeft} className="pointer-events-auto" />
        <SideButtonsMenu side="right" styles={styles.sideRight} className="pointer-events-auto" />

        <FoodPanel isOpen={isFoodOpen} onClose={() => setIsFoodOpen(false)} styles={styles.food} />

        <BottomMenu styles={styles.bottom} className="pointer-events-auto" />
      </div>
    </div>
  );
};
