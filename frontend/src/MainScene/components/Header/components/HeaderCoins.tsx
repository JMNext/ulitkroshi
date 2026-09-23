import { ShopModal } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/ShopModal";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import coinImg from "@/assets/buttom_menu-icons/eat.svg";
import plusImg from "@/assets/interface-icons/plus.svg";
import NiceModal from "@ebay/nice-modal-react";

export const HeaderCoins = () => (
  <div className="flex h-[80px] w-[290px] shrink-0 items-center justify-between rounded-[40px] border-[3px] border-white bg-[#fff6e9] px-4 shadow-sm">
    <img src={coinImg} className="h-[68px] w-[68px] object-contain" alt="" />
    <span className="mx-2 flex-1 truncate text-center text-[24px] font-black text-[#334155]">{useMainGameStore((s) => s.coins) ?? 0}</span>
    <button type="button" data-ui-action="shop" onClick={() => NiceModal.show(ShopModal)} className="flex h-[50px] w-[50px] cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 outline-none">
      <img src={plusImg} className="h-full w-full object-contain" alt="" />
    </button>
  </div>
);
