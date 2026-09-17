import { ShopModal } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/ShopModal";
import NiceModal from "@ebay/nice-modal-react";
import { clsx } from "clsx";
import React, { useEffect, useRef, useState } from "react";
import defaultEatIcon from "@/assets/buttom_menu-icons/eat.svg";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { DYNAMIC_BOOSTS, getFruitUrlByStoreId, getGroupStyles } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/constants/shop.constants";

const FOOD_IDS = ["fruit_01", "fruit_02", "fruit_03", "fruit_04"];
const CATEGORY_MAP: Record<string, string> = { fruit_01: "health_25", fruit_02: "health_50", fruit_03: "exp_25", fruit_04: "exp_50" };
const BOOST_TYPES_MAP = Object.fromEntries(DYNAMIC_BOOSTS.map((b) => [b.id, b.type]));

interface FoodPanelProps {
  isOpen: boolean;
  onClose: () => void;
  styles: React.CSSProperties;
}

export const FoodPanel = ({ isOpen, onClose, styles }: FoodPanelProps) => {
  const { fruitsCounts, fruitsCooldowns, activeFruitIds, currentFruitId, selectFruitId } = usePetStore();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };

    const interval = setInterval(() => setNow(Date.now()), 1000);

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      clearInterval(interval);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCardClick = (id: string, isZero: boolean) => {
    if (isZero) {
      NiceModal.show(ShopModal);
    } else {
      selectFruitId(id);
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute left-1/2 z-50 pt-5 transition-all duration-150 will-change-transform outline-none"
      style={{ ...styles, transformOrigin: "bottom center" }}
    >
      <div className="food-panel-container pointer-events-auto box-border flex h-[72px] w-max items-center justify-center gap-3 rounded-[16px] border border-solid border-[#e5e5e5] bg-white/95 p-2 shadow-sm">
        {FOOD_IDS.map((id) => {
          const count = fruitsCounts[id] ?? 0;
          const fruitId = activeFruitIds[id] ?? 1;
          const isZero = count <= 0;
          const isSel = currentFruitId === id;
          const timeLeft = Math.max(0, Math.ceil(((fruitsCooldowns[id] ?? 0) - now) / 1000));
          const isCool = !isZero && !isSel && timeLeft > 0 && timeLeft <= 360;
          const boostType = BOOST_TYPES_MAP[fruitId] || CATEGORY_MAP[id];
          const groupStyles = getGroupStyles(boostType);

          return (
            <div
              key={id}
              onClick={() => !isCool && handleCardClick(id, isZero)}
              className={clsx(
                "relative box-border flex h-14 w-14 cursor-pointer touch-manipulation items-center justify-center rounded-[12px] border-[3px] border-solid transition-transform active:scale-95",
                groupStyles.card,
                isZero && "opacity-60 saturate-[0.85]",
                isCool && "pointer-events-none border-slate-400 opacity-70"
              )}
            >
              <img
                src={isSel && !isZero ? defaultEatIcon : getFruitUrlByStoreId(fruitId) || defaultEatIcon}
                className={clsx("pointer-events-none block h-11 w-11 object-contain", isZero && "opacity-40 grayscale", isCool && "opacity-30")}
                alt=""
              />
              {!(isSel && !isZero) && (
                <span className={clsx("pointer-events-none absolute -top-1 -right-1 z-20 rounded-full px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm", isZero ? "bg-gray-400" : "bg-[#f59e0b]")}>
                  {count}
                </span>
              )}
              {isCool && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[12px] bg-black/45">
                  <span className="text-[11px] font-black whitespace-nowrap text-white">
                    {`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
