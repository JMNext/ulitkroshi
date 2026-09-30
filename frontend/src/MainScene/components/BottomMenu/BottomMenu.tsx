import menuBgDesktop from "@/assets/background/bottom-menu-desktop.svg";
import menuBgMobile from "@/assets/background/bottom-menu-mobile.svg";
import eatIcon from "@/assets/buttom_menu-icons/eat.svg";
import playIcon from "@/assets/buttom_menu-icons/play.svg";
import sleepIcon from "@/assets/buttom_menu-icons/sleep.svg";
import washIcon from "@/assets/buttom_menu-icons/wash.svg";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { getFruitUrlByStoreId } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/constants/shop.constants";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { clsx } from "clsx";
import { useRef } from "react";
import { FoodPanel } from "./components/FoodPanel";
import { MenuButton } from "./components/MenuButton";

const ITEMS = [
  { type: "feed", name: "Кормить", icon: eatIcon, color: "#f59e0b", animPrefix: "eat" },
  { type: "wash", name: "Мыть", icon: washIcon, color: "#0ea5e9", animPrefix: "wash" },
  { type: "play", name: "Играть", icon: playIcon, color: "#f43f5e", animPrefix: "play" },
  { type: "sleep", name: "Спать", icon: sleepIcon, color: "#a855f7", animPrefix: "sleep" }
] as const;

interface BottomMenuProps {
  className?: string;
  isVert?: boolean;
}

export const BottomMenu = ({ className, isVert }: BottomMenuProps) => {
  const { currentId: cId, counts, activeIds } = usePetStore((s) => s.inventory);
  const { isFoodOpen, setIsFoodOpen } = useMainGameStore();
  const activeClickRef = useRef(false);

  const activeIcon = cId && counts[cId] && activeIds[cId] ? getFruitUrlByStoreId(activeIds[cId]) : eatIcon;

  return (
    <div
      className={clsx(
        "relative flex flex-col items-center justify-end select-none",
        isVert ? "h-[460px] w-[1080px] pb-8" : "h-[240px] w-[1080px] pb-4",
        className
      )}
    >
      <FoodPanel isOpen={isFoodOpen} onClose={() => setIsFoodOpen(false)} isVert={isVert} />
      <img
        src={isVert ? menuBgMobile : menuBgDesktop}
        className="pointer-events-none absolute inset-0 h-full w-full object-fill"
        alt=""
      />
      <div
        className={clsx(
          "relative z-10 flex justify-between items-end",
          isVert ? "w-[960px]" : "w-[540px]"
        )}
      >
        {ITEMS.map((item) => (
          <MenuButton
            key={item.type}
            name={item.name}
            type={item.type}
            icon={item.icon}
            color={item.color}
            animPrefix={item.animPrefix}
            activeFruitIcon={activeIcon}
            activeClickRef={activeClickRef}
            isVert={isVert}
          />
        ))}
      </div>
    </div>
  );
};
