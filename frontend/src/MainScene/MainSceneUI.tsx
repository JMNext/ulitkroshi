import { AvatarSelectModal } from "@/MainScene/components/Avatars/AvatarSelectModal";
import { BottomMenu } from "@/MainScene/components/BottomMenu/BottomMenu";
import { FoodPanel } from "@/MainScene/components/FoodPanel/FoodPanel";
import { Header } from "@/MainScene/components/Header/Header";
import { HelpModal } from "@/MainScene/components/HelpModal/HelpModal";
import { AddPetScannerModal } from "@/MainScene/components/LogicQRandAdd/AddPetScannerModal";
import { CareActionType, handleCareActionDown } from "@/MainScene/components/PetCharacter/animations/createBaseDrag";
import { PetCharacter } from "@/MainScene/components/PetCharacter/PetCharacter";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { ProfileEdit } from "@/MainScene/components/ProfileEdit/ProfileEdit";
import { SideButtonsMenu } from "@/MainScene/components/SideButtonsMenu/SideButtonsMenu";
import { MiniGamesModal } from "@/MainScene/components/SideButtonsMenuModal/MiniGamesModal/MiniGamesModal";
import { PetsModal } from "@/MainScene/components/SideButtonsMenuModal/PetsModal/PetsModal";
import { ShopModal } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/ShopModal";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import React, { useCallback } from "react";
import { takeScreenshot } from "./utils/takeScreenshot";

export const MainSceneUI = () => {
  const { modal, isFoodOpen, alertText, width, height, scale, finalScale, s, styles, setModal, setIsFoodOpen, setAlertText } =
    useMainGameStore();

  const handleUiAction = useCallback(
    (type: string) => {
      if (type === "foto") return takeScreenshot();
      const store = usePetStore.getState();
      if (type === "minigames" && ["sleep_circle", "sleep_begin", "sleep_awake"].includes(store.currentAnim)) {
        return setAlertText(store.incrementMiniGamesClick());
      }
      setModal(type);
    },
    [setModal, setAlertText]
  );

  const handleGlobalPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const foodCard = target.closest<HTMLElement>("[data-ui-food-id]");

    if (foodCard) {
      e.stopPropagation();
      const id = foodCard.getAttribute("data-ui-food-id")!;
      if (foodCard.getAttribute("data-ui-food-zero") === "true") return setModal("shop");
      usePetStore.getState().selectFruitId(id);
      return;
    }

    const btn = target.closest<HTMLElement>("[data-ui-bottom-action]");
    if (btn) {
      const type = btn.getAttribute("data-ui-bottom-action") as CareActionType | null;
      if (type && ["wash", "play", "feed", "sleep"].includes(type)) {
        handleCareActionDown(type, btn, scale, s, e.nativeEvent);
      }
      return;
    }

    const actBtn = target.closest<HTMLElement>("[data-ui-action]");
    if (actBtn) {
      (document.activeElement as HTMLElement)?.blur?.();
      const type = actBtn.getAttribute("data-ui-action");
      if (type) handleUiAction(type);
    }
  };

  if (!width || !height || !styles) return null;
  const isOpen = modal !== null;

  return (
    <div
      onPointerDown={handleGlobalPointerDown}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-hidden font-black select-none"
    >
      <div
        className={`pointer-events-none absolute box-border flex flex-col items-center justify-center opacity-100 transition-opacity [backface-visibility:hidden] ${isOpen ? "inset-0 h-full w-full" : "top-1/2 left-1/2 h-[1080px] w-[1920px]"}`}
        style={isOpen ? undefined : { transform: `translate(-50%, -50%) scale(${finalScale})` }}
      >
        {modal === "scan_pet" ? (
          <AddPetScannerModal onClose={() => setModal(null)} />
        ) : (
          !isOpen && (
            <>
              <Header styles={styles.header} />
              <PetCharacter
                styles={styles.pet}
                alertText={alertText}
                onAnimationEnd={(key: string) => {
                  usePetStore.getState().completeCareAction();
                  window.dispatchEvent(new CustomEvent("pet_animation_complete", { detail: key }));
                }}
              />
              <SideButtonsMenu side="left" styles={styles.sideLeft} />
              <SideButtonsMenu side="right" styles={styles.sideRight} />
              <FoodPanel isOpen={isFoodOpen} onClose={() => setIsFoodOpen(false)} now={Date.now()} styles={styles.food} />
              <BottomMenu styles={styles.bottom} />
            </>
          )
        )}
      </div>
      {modal === "avatar_select" && <AvatarSelectModal onClose={() => setModal("profile")} />}
      {modal === "profile" && <ProfileEdit onClose={() => setModal(null)} />}
      {modal === "pets" && <PetsModal onClose={() => setModal(null)} />}
      {modal === "minigames" && <MiniGamesModal onClose={() => setModal(null)} />}
      {modal === "shop" && <ShopModal onClose={() => setModal(null)} />}
      {modal === "help" && <HelpModal onClose={() => setModal(null)} />}
    </div>
  );
};
