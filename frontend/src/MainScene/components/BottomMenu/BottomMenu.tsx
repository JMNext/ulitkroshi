import { CareActionType, handleCareActionDown } from "@/MainScene/components/PetCharacter/animations/createBaseDrag";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { getFruitUrlByStoreId } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/constants/shop.constants";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { clsx } from "clsx";
import React, { useRef } from "react";
import menuBg from "@/assets/background/bottom-menu-desktop.svg";
import btnBg from "@/assets/buttom_menu-icons/button.svg";
import eatIcon from "@/assets/buttom_menu-icons/eat.svg";
import playIcon from "@/assets/buttom_menu-icons/play.svg";
import sleepIcon from "@/assets/buttom_menu-icons/sleep.svg";
import washIcon from "@/assets/buttom_menu-icons/wash.svg";

const MENU_ITEMS = [
  { type: "feed", name: "Кормить", icon: eatIcon, color: "#f59e0b", animPrefix: "eat" },
  { type: "wash", name: "Мыть", icon: washIcon, color: "#0ea5e9", animPrefix: "wash" },
  { type: "play", name: "Играть", icon: playIcon, color: "#f43f5e", animPrefix: "play" },
  { type: "sleep", name: "Спать", icon: sleepIcon, color: "#a855f7", animPrefix: "sleep" }
] as const;

interface BottomMenuProps {
  styles: React.CSSProperties;
  className?: string;
}

export const BottomMenu = ({ styles, className }: BottomMenuProps) => {
  const { currentAnim, canExecuteAction, triggerSleepAction, inventory } = usePetStore();
  const { currentId: currentFruitId, counts: fruitsCounts, activeIds: activeFruitIds } = inventory;
  const { scale, s } = useMainGameStore();
  const activeClickRef = useRef<boolean>(false);

  const fruitCount = currentFruitId ? fruitsCounts[currentFruitId] : 0;
  const activeFruitIcon = fruitCount && activeFruitIds[currentFruitId] ? getFruitUrlByStoreId(activeFruitIds[currentFruitId]) : eatIcon;

  const handleActionClick = (type: CareActionType, icon: string, e: React.PointerEvent<HTMLDivElement>) => {
    if (activeClickRef.current) return;

    if (type === "sleep") {
      activeClickRef.current = true;
      setTimeout(() => { activeClickRef.current = false; }, 1000);
      triggerSleepAction();
    } else {
      if (!canExecuteAction(type)) return;
      activeClickRef.current = true;
      setTimeout(() => { activeClickRef.current = false; }, 300);
      handleCareActionDown(type, icon, activeFruitIcon, scale, s, e);
    }
  };

  return (
    <div className={clsx("pointer-events-auto absolute left-1/2 transition-all duration-150", className)} style={styles}>
      <div className="relative flex h-[240px] w-[1080px] items-center justify-center">
        <img src={menuBg} className="pointer-events-none absolute inset-0 h-full w-full object-contain" alt="" />
        <div className="relative z-10 flex w-[520px] justify-between pt-[45px]">
          {MENU_ITEMS.map(({ name, type, icon, color, animPrefix }) => {
            const isAct = currentAnim.startsWith(animPrefix);
            const isSelectable = canExecuteAction(type) || isAct;
            const currentIcon = type === "feed" ? activeFruitIcon : icon;

            return (
              <div
                key={type}
                onPointerDown={(e) => {
                  if (isSelectable) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleActionClick(type, icon, e);
                  }
                }}
                className={clsx(
                  "flex w-[110px] flex-col items-center transition-all duration-150 select-none",
                  isSelectable ? "cursor-pointer touch-none opacity-100" : "pointer-events-none opacity-40"
                )}
              >
                <div className="relative flex h-[95px] w-[95px] items-center justify-center transition-transform duration-100">
                  <div
                    className="pointer-events-none absolute inset-0 scale-[1.55] rounded-full transition-opacity duration-100"
                    style={{
                      background: isAct ? `radial-gradient(circle, ${color} 0%, transparent 70%)` : "none",
                      opacity: isAct ? 0.8 : 0
                    }}
                  />
                  <img src={btnBg} className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain" alt="" />
                  <img src={currentIcon} className="pointer-events-none relative z-20 h-[57px] w-[57px] object-contain" alt="" />
                </div>
                <span className="pointer-events-none mt-2.5 text-[18px] font-black whitespace-nowrap text-[#525252]">{name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
