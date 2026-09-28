import sideBtnBg from "@/assets/interface-icons/button.svg";
import fotoIcon from "@/assets/interface-icons/foto.svg";
import shopIcon from "@/assets/interface-icons/shop.svg";
import { ShopModal } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/ShopModal";
import { takeScreenshot } from "@/MainScene/utils/takeScreenshot";
import NiceModal from "@ebay/nice-modal-react";

export const SideMenuLeft = () => (
  <div className="pointer-events-auto flex flex-col items-center justify-center gap-5">
    <button type="button" onClick={() => NiceModal.show(ShopModal)} className="relative box-border flex h-[120px] w-[120px] cursor-pointer touch-manipulation items-center justify-center bg-transparent p-0 transition-transform active:scale-95 border-0 outline-none">
      <img src={sideBtnBg} className="pointer-events-none absolute inset-0 h-full w-full object-contain" alt="" />
      <img src={shopIcon} className="pointer-events-none relative z-10 h-20 w-20 object-contain" alt="" />
    </button>

    <button type="button" onClick={() => takeScreenshot()} className="relative box-border flex h-[120px] w-[120px] cursor-pointer touch-manipulation items-center justify-center bg-transparent p-0 transition-transform active:scale-95 border-0 outline-none">
      <img src={sideBtnBg} className="pointer-events-none absolute inset-0 h-full w-full object-contain" alt="" />
      <img src={fotoIcon} className="pointer-events-none relative z-10 h-20 w-20 object-contain" alt="" />
    </button>
  </div>
);
