import sideBtnBg from "@/assets/interface-icons/button.svg";
import fotoIcon from "@/assets/interface-icons/foto.svg";
import minigameIcon from "@/assets/interface-icons/mini-game.svg";
import mypetsIcon from "@/assets/interface-icons/my-pets.svg";
import shopIcon from "@/assets/interface-icons/shop.svg";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { MiniGamesModal } from "@/MainScene/components/SideButtonsMenuModal/MiniGamesModal/MiniGamesModal";
import { PetsModal } from "@/MainScene/components/SideButtonsMenuModal/PetsModal/PetsModal";
import { ShopModal } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/ShopModal";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { takeScreenshot } from "@/MainScene/utils/takeScreenshot";
import NiceModal from "@ebay/nice-modal-react";
import { clsx } from "clsx";
import React from "react";

interface SideButtonsMenuProps {
  side: "left" | "right";
  styles: React.CSSProperties;
  className?: string;
}

const SIDE_BUTTONS = {
  left: [
    { id: "shop", icon: shopIcon },
    { id: "foto", icon: fotoIcon }
  ],
  right: [
    { id: "minigames", icon: minigameIcon },
    { id: "pets", icon: mypetsIcon }
  ]
};

export const SideButtonsMenu = ({ side, styles, className }: SideButtonsMenuProps) => {
  const setAlertText = useMainGameStore((s) => s.setAlertText);

  const handleActionClick = (id: string) => {
    if (id === "shop") return NiceModal.show(ShopModal);
    if (id === "pets") return NiceModal.show(PetsModal);
    if (id === "foto") return takeScreenshot();
    if (id === "minigames") {
      const store = usePetStore.getState();
      if (["sleep_circle", "sleep_begin", "sleep_awake"].includes(store.currentAnim)) {
        return setAlertText(store.incrementMiniGamesClick());
      }
      NiceModal.show(MiniGamesModal);
    }
  };

  return (
    <div
      className={clsx(
        "pointer-events-auto absolute z-30 transition-all duration-150",
        side === "left" ? "origin-left" : "origin-right",
        className
      )}
      style={styles}
    >
      <div className="flex flex-col items-center justify-center gap-5">
        {SIDE_BUTTONS[side].map(({ id, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleActionClick(id)}
            className="relative m-0 box-border flex h-[120px] w-[120px] cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 transition-transform outline-none active:scale-95"
          >
            <img src={sideBtnBg} className="pointer-events-none absolute inset-0 h-full w-full object-contain" alt="" />
            <img src={icon} className="pointer-events-none relative z-10 h-20 w-20 object-contain" alt="" />
          </button>
        ))}
      </div>
    </div>
  );
};
