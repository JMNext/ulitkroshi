import { ShopModal } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/ShopModal";
import NiceModal from "@ebay/nice-modal-react";
import { clsx } from "clsx";
import React, { useEffect, useRef, useState } from "react";
import defaultEatIcon from "@/assets/buttom_menu-icons/eat.svg";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { getFruitUrlByStoreId } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/constants/shop.constants";

const FOOD_IDS = ["fruit_01", "fruit_02", "fruit_03", "fruit_04"];

const SLOT_DEFAULT_STORE_IDS: Record<string, number> = {
  fruit_01: 1,
  fruit_02: 4,
  fruit_03: 7,
  fruit_04: 11,
};

interface FoodPanelProps {
  isOpen: boolean;
  onClose: () => void;
  styles: React.CSSProperties;
}

export const FoodPanel = ({ isOpen, onClose, styles }: FoodPanelProps) => {
  const { inventory, selectFruitId } = usePetStore();
  const { counts: fruitsCounts, cooldowns: fruitsCooldowns, activeIds: activeFruitIds, currentId: currentFruitId } = inventory;
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

  const getSlotStylesByType = (boostType: string) => {
    switch (boostType) {
      case "health_25":
        return { borderColor: "#81c784", background: "linear-gradient(to bottom, #f1f5f9, #e2e8f0, #cbd5e1)", color: "#2e7d32" };
      case "health_50":
        return { borderColor: "#ffd54f", background: "linear-gradient(to bottom, #f1f5f9, #e2e8f0, #cbd5e1)", color: "#f57c00" };
      case "health_100":
        return { borderColor: "#f43f5e", background: "linear-gradient(to bottom, #fff1f2, #ffe4e6, #fecdd3)", color: "#e11d48" };
      case "exp_25":
        return { borderColor: "#4fc3f7", background: "linear-gradient(to bottom, #f1f5f9, #e2e8f0, #cbd5e1)", color: "#0288d1" };
      case "exp_50":
        return { borderColor: "#ba68c8", background: "linear-gradient(to bottom, #f1f5f9, #e2e8f0, #cbd5e1)", color: "#7b1fa2" };
      default:
        return { borderColor: "#cbd5e1", background: "#ffffff", color: "#000000" };
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
          const isZero = count <= 0;
          const isSel = currentFruitId === id;
          const timeLeft = Math.max(0, Math.ceil(((fruitsCooldowns[id] ?? 0) - now) / 1000));
          const isCool = !isZero && !isSel && timeLeft > 0 && timeLeft <= 360;

          const storeFruitId = activeFruitIds && activeFruitIds[id] ? activeFruitIds[id] : SLOT_DEFAULT_STORE_IDS[id];

          let boostType = "health_25";
          if (id === "fruit_02") {
            boostType = Number(storeFruitId) === 9 ? "health_100" : "health_50";
          } else if (id === "fruit_03") {
            boostType = "exp_25";
          } else if (id === "fruit_04") {
            boostType = "exp_50";
          }

          const customStyle = getSlotStylesByType(boostType);

          return (
            <div
              key={id}
              onClick={() => !isCool && handleCardClick(id, isZero)}
              style={isCool ? { borderColor: "#94a3b8" } : customStyle}
              className={clsx(
                "relative box-border flex h-14 w-14 cursor-pointer touch-manipulation items-center justify-center rounded-[12px] border-[3px] border-solid transition-transform active:scale-95 [text-shadow:0_1px_0_rgba(255,255,255,0.6)]",
                isZero && "opacity-60 saturate-[0.85]",
                isCool && "pointer-events-none opacity-70"
              )}
            >
              <img
                src={isSel && !isZero ? defaultEatIcon : getFruitUrlByStoreId(storeFruitId) || defaultEatIcon}
                className={clsx("pointer-events-none block h-11 w-11 object-contain", isZero && "opacity-40 grayscale", isCool && "opacity-30")}
                alt=""
              />
              {!(isSel && !isZero) && (
                <span className={clsx("pointer-events-none absolute -top-1 -right-1 z-20 rounded-full px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm", isZero ? "bg-gray-400" : "bg-[#f59e0b]")}>
                  {count}
                </span>
              )}
              {isCool && (
                <div className="pointer-events-none absolute inset-x-0 bottom-1 z-10 flex items-center justify-center px-1">
                  <span className="rounded-[6px] bg-black/75 px-1 py-0.5 text-[11px] font-black leading-none tracking-wider text-white shadow-sm">
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
