import React, { useRef, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { getFruitUrlByStoreId, getGroupStyles, DYNAMIC_BOOSTS } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/shop.constants";
import { FOOD_IDS, CATEGORY_MAP, DEFAULT_EAT_ICON } from "./foodPanel.constants";

interface FoodPanelProps {
  isOpen: boolean;
  onClose: () => void;
  now: number;
  styles: React.CSSProperties;
}

const BOOST_TYPES_MAP = Object.fromEntries(DYNAMIC_BOOSTS.map((b) => [b.id, b.type]));

export const FoodPanel = ({ isOpen, onClose, now, styles }: FoodPanelProps) => {
  const {
    fruitsCounts = {},
    fruitsCooldowns = {},
    activeFruitIds = {},
    currentFruitId = ""
  } = usePetStore();
  
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Popover.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Popover.Anchor className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none" />
      <div 
        ref={panelRef}
        className="absolute left-1/2 z-50 transition-all duration-150 will-change-transform"
        style={{ 
          bottom: styles.bottom, 
          transform: styles.transform, 
          width: styles.width,
          transformOrigin: "bottom center"
        }}
      >
        <div className="box-border flex h-[72px] w-max items-center justify-center gap-3 rounded-[16px] border border-solid border-[#e5e5e5] bg-white/95 p-2 shadow-sm food-panel-container pointer-events-auto">
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
                data-ui-food-id={id} 
                data-ui-food-zero={String(isZero)} 
                data-ui-food-cooling={String(isCool)} 
                data-ui-food-selected={String(isSel)} 
                className={`relative box-border flex h-14 w-14 cursor-pointer touch-manipulation items-center justify-center rounded-[12px] border-[3px] border-solid transition-transform active:scale-95 ${groupStyles.card} ${
                  isZero ? "opacity-60 saturate-[0.85]" : ""
                } ${
                  isCool ? "opacity-70 border-slate-400 pointer-events-none" : ""
                }`}
              >
                <img 
                  src={isSel && !isZero ? DEFAULT_EAT_ICON : (getFruitUrlByStoreId(fruitId) || DEFAULT_EAT_ICON)} 
                  className={`pointer-events-none block h-11 w-11 object-contain ${isZero ? "opacity-40 grayscale" : ""} ${isCool ? "opacity-30" : ""}`} 
                  alt="" 
                />
                {!(isSel && !isZero) && (
                  <span className={`pointer-events-none absolute -top-1 -right-1 z-20 rounded-full px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm ${isZero ? "bg-gray-400" : "bg-[#f59e0b]"}`}>
                    {count}
                  </span>
                )}
                {isCool && (
                  <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[12px] bg-black/45">
                    <span className="text-[11px] font-black text-white whitespace-nowrap">
                      {`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Popover.Root>
  );
};
