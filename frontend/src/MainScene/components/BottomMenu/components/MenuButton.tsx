import btnBg from "@/assets/buttom_menu-icons/button.svg";
import { CareActionType, handleCareActionDown } from "@/MainScene/components/PetCharacter/animations/createBaseDrag";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { clsx } from "clsx";
import React from "react";

interface MenuButtonProps {
  name: string;
  type: CareActionType;
  icon: string;
  color: string;
  animPrefix: string;
  activeFruitIcon: string;
  activeClickRef: React.MutableRefObject<boolean>;
  isVert?: boolean;
}

export const MenuButton = ({
  name,
  type,
  icon,
  color,
  animPrefix,
  activeFruitIcon,
  activeClickRef,
  isVert
}: MenuButtonProps) => {
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
      onPointerDown={(e) => {
        if (isSelectable) {
          e.preventDefault();
          e.stopPropagation();
          handleAction(e);
        }
      }}
      className={clsx(
        "flex flex-col items-center select-none transition-transform duration-100 active:scale-95",
        isVert ? "w-[216px]" : "w-[124px]",
        isSelectable ? "cursor-pointer touch-none opacity-100" : "pointer-events-none opacity-40"
      )}
    >
      <div
        className={clsx(
          "relative flex items-center justify-center",
          isVert ? "h-[195px] w-[200px]" : "h-[115px] w-[117px]"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 scale-[1.3] rounded-full transition-opacity duration-150"
          style={{
            background: isAct ? `radial-gradient(circle, ${color} 0%, transparent 70%)` : "none",
            opacity: isAct ? 0.85 : 0
          }}
        />
        <img
          src={btnBg}
          className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain drop-shadow-md"
          alt=""
        />
        <img
          src={type === "feed" ? activeFruitIcon : icon}
          className={clsx(
            "pointer-events-none relative z-20 object-contain drop-shadow-sm",
            isVert ? "h-[142px] w-[142px]" : "h-[84px] w-[84px]"
          )}
          alt={name}
        />
      </div>
      <span
        className={clsx(
          "pointer-events-none font-black text-[#4C5247] whitespace-nowrap tracking-wide leading-none",
          isVert ? "mt-2.5 text-[34px]" : "mt-2 text-[17px]"
        )}
      >
        {name}
      </span>
    </div>
  );
};
