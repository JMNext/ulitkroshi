import btnBg from "@/assets/buttom_menu-icons/button.svg";
import { CareActionType, handleCareActionDown } from "@/MainScene/components/PetCharacter/animations/createBaseDrag";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { clsx } from "clsx";
import React from "react";

interface MenuButtonProps {
  name: string; type: CareActionType; icon: string; color: string; animPrefix: string; activeFruitIcon: string; activeClickRef: React.MutableRefObject<boolean>;
}

export const MenuButton = ({ name, type, icon, color, animPrefix, activeFruitIcon, activeClickRef }: MenuButtonProps) => {
  const currentAnim = usePetStore((s) => s.currentAnim);
  const canExecute = usePetStore((s) => s.canExecuteAction);

  const isAct = currentAnim.startsWith(animPrefix);
  const isSelectable = canExecute(type) || isAct;

  const handleAction = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activeClickRef.current) return;
    activeClickRef.current = true;
    setTimeout(() => { activeClickRef.current = false; }, type === "sleep" ? 1000 : 300);

    if (type === "sleep" || canExecute(type)) {
      handleCareActionDown(type, icon, activeFruitIcon, 1, 1, e);
    }
  };

  return (
    <div
      onPointerDown={(e) => { if (isSelectable) { e.preventDefault(); e.stopPropagation(); handleAction(e); } }}
      className={clsx("flex w-[110px] flex-col items-center select-none", isSelectable ? "cursor-pointer touch-none opacity-100" : "pointer-events-none opacity-40")}
    >
      <div className="relative flex h-[95px] w-[95px] items-center justify-center">
        <div className="pointer-events-none absolute inset-0 scale-[1.55] rounded-full transition-opacity duration-150" style={{ background: isAct ? `radial-gradient(circle, ${color} 0%, transparent 70%)` : "none", opacity: isAct ? 0.8 : 0 }} />
        <img src={btnBg} className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain" alt="" />
        <img src={type === "feed" ? activeFruitIcon : icon} className="pointer-events-none relative z-20 h-[57px] w-[57px] object-contain" alt="" />
      </div>
      <span className="pointer-events-none mt-2.5 text-[18px] font-black whitespace-nowrap text-[#525252]">{name}</span>
    </div>
  );
};
