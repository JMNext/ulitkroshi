import React, { useEffect, useCallback, useMemo } from "react";
import { BottomMenu } from "@/MainScene/components/BottomMenu/BottomMenu";
import { FoodPanel } from "@/MainScene/components/FoodPanel/FoodPanel";
import { Header } from "@/MainScene/components/Header/Header";
import { AddPetScannerModal } from "@/MainScene/components/LogicQRandAdd/AddPetScannerModal";
import { PetCharacter } from "@/MainScene/components/PetCharacter/PetCharacter";
import { SideButtonsMenu } from "@/MainScene/components/SideButtonsMenu/SideButtonsMenu";
import { MiniGamesModal } from "@/MainScene/components/SideButtonsMenuModal/MiniGamesModal/MiniGamesModal";
import { PetsModal } from "@/MainScene/components/SideButtonsMenuModal/PetsModal/PetsModal";
import { ShopModal } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/ShopModal";
import { HelpModal } from "@/MainScene/components/HelpModal/HelpModal";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { takeScreenshot } from "./utils/takeScreenshot";
import { calculateLayout } from "./utils/screenLayout";
import { ProfileEdit } from "@/MainScene/components/ProfileEdit/ProfileEdit";
import {
  CareActionType,
  handleCareActionDown
} from "@/MainScene/components/PetCharacter/animations/createBaseDrag";
import { AvatarSelectModal } from "@/MainScene/components/Avatars/AvatarSelectModal";

export const MainSceneUI = () => {
  const {
    modal,
    isFoodOpen,
    alertText,
    width,
    height,
    isVert,
    setModal,
    setIsFoodOpen,
    setAlertText
  } = useMainGameStore();

  const { layoutContext: ctx, finalScale } = useMemo(
    () => calculateLayout(width, height, isVert),
    [width, height, isVert]
  );

  const handleUiAction = useCallback(
    (type: string) => {
      if (type === "foto") return takeScreenshot();
      const store = usePetStore.getState();
      if (
        type === "minigames" &&
        ["sleep_circle", "sleep_begin", "sleep_awake"].includes(
          store.currentAnim
        )
      ) {
        return setAlertText(store.incrementMiniGamesClick());
      }
      setModal(type);
    },
    [setModal, setAlertText]
  );

  const handleGlobalPointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    const target = e.target as HTMLElement;

    const foodCard = target.closest<HTMLElement>("[data-ui-food-id]");
    if (foodCard) {
      e.stopPropagation();
      const id = foodCard.getAttribute("data-ui-food-id")!;
      const isZero = foodCard.getAttribute("data-ui-food-zero") === "true";
      
      if (isZero) {
        return useMainGameStore.getState().setModal("shop");
      }
      
      usePetStore.getState().selectFruitId(id);
      return;
    }

    const btn = target.closest<HTMLElement>(
      "[data-ui-bottom-action]"
    );
    if (btn) {
      const type = btn.getAttribute(
        "data-ui-bottom-action"
      ) as CareActionType | null;
      if (type && ["wash", "play", "feed", "sleep"].includes(type)) {
        handleCareActionDown(
          type,
          btn,
          ctx.scale,
          ctx.s,
          e.nativeEvent
        );
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

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onMod = (e: Event) =>
      handleUiAction((e as CustomEvent).detail);
    const onBtn = (e: Event) => {
      clearTimeout(timer);
      setAlertText((e as CustomEvent).detail.text);
      timer = setTimeout(() => setAlertText(null), 3000);
    };
    const toggleFood = () => setIsFoodOpen((p) => !p);

    window.addEventListener("ui_open_modal", onMod);
    window.addEventListener("ui_toggle_food", toggleFood);
    window.addEventListener("ui_show_bubble", onBtn);
    return () => {
      window.removeEventListener("ui_open_modal", onMod);
      window.removeEventListener("ui_toggle_food", toggleFood);
      window.removeEventListener("ui_show_bubble", onBtn);
      clearTimeout(timer);
    };
  }, [handleUiAction, setAlertText, setIsFoodOpen]);

  const closeModal = () => setModal(null);
  const isOpen = modal !== null;

  if (!width || !height || width === 0 || height === 0) {
    return null;
  }

  return (
    <div
      onPointerDown={handleGlobalPointerDown}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-hidden font-black select-none"
    >
      <div
        className={`pointer-events-none absolute box-border flex flex-col items-center justify-center [backface-visibility:hidden] ${isOpen ? "inset-0 h-full w-full" : "top-1/2 left-1/2 h-[1080px] w-[1920px]"}`}
        style={
          isOpen
            ? undefined
            : {
                transform: `translate(-50%, -50%) scale(${finalScale})`
              }
        }
      >
        {modal === "scan_pet" ? (
          <AddPetScannerModal onClose={closeModal} />
        ) : (
          !isOpen && (
            <>
              <Header styles={ctx.headerStyles} />
              <PetCharacter
                styles={ctx.petStyles}
                alertText={alertText}
                onAnimationEnd={(key: string) => {
                  usePetStore.getState().completeCareAction();
                  window.dispatchEvent(
                    new CustomEvent("pet_animation_complete", {
                      detail: key
                    })
                  );
                }}
              />
              <SideButtonsMenu
                side="left"
                styles={ctx.sideMenuStyles.left}
              />
              <SideButtonsMenu
                side="right"
                styles={ctx.sideMenuStyles.right}
              />
              <FoodPanel
                isOpen={isFoodOpen}
                onClose={() => setIsFoodOpen(false)}
                now={Date.now()}
                styles={ctx.foodPanelStyles}
              />
              <BottomMenu styles={ctx.bottomMenuStyles} />
            </>
          )
        )}
      </div>
      {modal === "avatar_select" && (
        <AvatarSelectModal onClose={() => setModal("profile")} />
      )}
      {modal === "profile" && <ProfileEdit onClose={closeModal} />}
      {modal === "pets" && <PetsModal onClose={closeModal} />}
      {modal === "minigames" && (
        <MiniGamesModal onClose={closeModal} />
      )}
      {modal === "shop" && <ShopModal onClose={closeModal} />}
      {modal === "help" && <HelpModal onClose={closeModal} />}
    </div>
  );
};
