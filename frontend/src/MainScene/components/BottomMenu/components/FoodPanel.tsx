import { useEffect, useRef } from "react";
import { FoodSlot } from "./FoodSlot";

const FOOD_IDS = ["fruit_01", "fruit_02", "fruit_03", "fruit_04"];

export const FoodPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const clickOutside = (e: MouseEvent) => panelRef.current && !panelRef.current.contains(e.target as Node) && onClose();
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, [isOpen, onClose]);

  return isOpen ? (
    <div ref={panelRef} className="absolute bottom-[180px] left-1/2 z-50 -translate-x-1/2 pt-5 transition-all duration-150 will-change-transform outline-none">
      <div className="food-panel-container pointer-events-auto box-border flex h-[72px] w-max items-center justify-center gap-3 rounded-[16px] border border-solid border-[#e5e5e5] bg-white/95 p-2 shadow-sm backdrop-blur-sm">
        {FOOD_IDS.map((id) => <FoodSlot key={id} id={id} />)}
      </div>
    </div>
  ) : null;
};
