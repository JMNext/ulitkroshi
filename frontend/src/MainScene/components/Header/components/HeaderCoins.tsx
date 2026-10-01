import { ShopModal } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/ShopModal";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import coinImg from "@/assets/buttom_menu-icons/eat.svg";
import plusImg from "@/assets/interface-icons/plus.svg";
import NiceModal from "@ebay/nice-modal-react";
import { clsx } from "clsx";

interface HeaderCoinsProps {
  isVert?: boolean;
}

export const HeaderCoins = ({ isVert }: HeaderCoinsProps) => (
  <button
    type="button"
    data-ui-action="shop"
    onClick={() => NiceModal.show(ShopModal)}
    className={clsx(
      "pointer-events-auto flex shrink-0 cursor-pointer touch-manipulation items-center justify-between rounded-full border-2 border-white/90 bg-gradient-to-b from-white to-[#FFF6E9] shadow-[0px_4px_20px_0px_rgba(152,158,144,0.35)] select-none outline-none transition-transform active:scale-95",
      isVert
        ? "h-[64px] w-[196px] px-2.5"
        : "h-[94px] w-[290px] px-3.5"
    )}
    aria-label="Магазин"
  >
    <img
      src={coinImg}
      className={clsx(
        "object-contain pointer-events-none drop-shadow-sm",
        isVert ? "h-[50px] w-[50px]" : "h-[74px] w-[74px]"
      )}
      alt="Печеньки"
    />
    <span
      className={clsx(
        "mx-1.5 flex-1 truncate text-center font-black text-[#1e293b] tracking-tight tabular-nums pointer-events-none",
        isVert ? "text-[22px]" : "text-[32px]"
      )}
    >
      {useMainGameStore((s) => s.coins) ?? 0}
    </span>
    <div
      className={clsx(
        "flex items-center justify-center p-0 pointer-events-none",
        isVert ? "h-[40px] w-[40px]" : "h-[56px] w-[56px]"
      )}
    >
      <img src={plusImg} className="h-full w-full object-contain pointer-events-none" alt="+" />
    </div>
  </button>
);
