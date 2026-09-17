import { AVAILABLE_AVATARS } from "@/MainScene/components/Avatars/Avatars";
import { ProfileEdit } from "@/MainScene/components/ProfileEdit/ProfileEdit";
import { ShopModal } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/ShopModal";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import coinImg from "@/assets/buttom_menu-icons/eat.svg";
import plusImg from "@/assets/interface-icons/plus.svg";
import NiceModal from "@ebay/nice-modal-react";
import { clsx } from "clsx";
import React from "react";

interface HeaderProps {
  styles: React.CSSProperties;
  className?: string;
}

export const Header = ({ styles, className }: HeaderProps) => {
  const { coins, avatarId: currentAvatarId = "default" } = useMainGameStore();

  const displayCoins = coins ?? 0;

  const currentAvatar = AVAILABLE_AVATARS.find((a) => a.id === currentAvatarId) || AVAILABLE_AVATARS[0];
  const AvatarComponent = currentAvatar?.Component;

  return (
    <div
      className={clsx(
        "pointer-events-none absolute left-1/2 z-40 box-border px-4 transition-all duration-150 sm:px-8 md:px-12 desktop:px-[60px] landscape:px-[60px]",
        className
      )}
      style={styles}
    >
      <div className="relative h-[90px] w-full">
        <div className="pointer-events-auto absolute top-1/2 left-0 flex h-[80px] w-[290px] shrink-0 -translate-y-1/2 items-center justify-between rounded-[40px] border-[3px] border-white bg-[#fff6e9] px-4 shadow-sm transition-all duration-150 desktop:-left-[44px] landscape:-left-[44px]">
          <img src={coinImg} className="h-[68px] w-[68px] object-contain" alt="" />
          <span className="mx-2 flex-1 truncate text-center text-[24px] font-black text-[#334155]">{displayCoins}</span>
          <button
            type="button"
            data-ui-action="shop"
            onClick={() => NiceModal.show(ShopModal)}
            className="flex h-[50px] w-[50px] cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 transition-transform outline-none active:scale-95"
          >
            <img src={plusImg} className="h-full w-full object-contain" alt="" />
          </button>
        </div>

        <button
          type="button"
          data-ui-action="profile"
          onClick={() => NiceModal.show(ProfileEdit)}
          className={clsx(
            "pointer-events-auto absolute top-1/2 right-0 flex h-[90px] w-[90px] shrink-0 -translate-y-1/2 cursor-pointer touch-manipulation items-center justify-center overflow-hidden rounded-full border-0 bg-transparent p-0 transition-all duration-150 outline-none active:scale-95 desktop:-right-[44px] landscape:-right-[44px]",
            currentAvatarId !== "default" && "border-[3px] border-white bg-[#fff6e9] p-1.5 shadow-sm"
          )}
        >
          <div className="flex h-full w-full items-center justify-center">
            {AvatarComponent && <AvatarComponent />}
          </div>
        </button>
      </div>
    </div>
  );
};
