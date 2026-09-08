import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { AVAILABLE_AVATARS } from "@/MainScene/Avatars/Avatars";
import coinImg from "@/assets/buttom_menu-icons/eat.svg";
import plusImg from "@/assets/interface-icons/plus.svg";

export const Header = ({
  styles
}: {
  styles: React.CSSProperties;
}) => {
  const { coins = 0, avatarId: currentAvatarId = "default" } =
    useMainGameStore();

  const AvatarComponent = (
    AVAILABLE_AVATARS.find((a) => a.id === currentAvatarId) ||
    AVAILABLE_AVATARS[0]
  )?.Component;

  return (
    <div
      className="pointer-events-none absolute left-1/2 z-40 box-border w-full px-4 transition-all duration-150 sm:px-8 md:px-12"
      style={styles}
    >
      <div className="mx-auto flex w-full max-w-[540px] items-center justify-between landscape:max-w-[1920px]">
        <div className="pointer-events-auto flex h-[80px] w-[290px] shrink-0 items-center justify-between rounded-[40px] border-[3px] border-white bg-[#fff6e9] px-4 shadow-sm">
          <img
            src={coinImg}
            className="h-[68px] w-[68px] object-contain"
            alt=""
          />
          <span className="mx-2 flex-1 truncate text-center text-[24px] font-black text-[#334155]">
            {coins}
          </span>
          <button
            type="button"
            data-ui-action="shop"
            className="flex h-[50px] w-[50px] cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 transition-transform outline-none active:scale-95"
          >
            <img
              src={plusImg}
              className="h-full w-full object-contain"
              alt=""
            />
          </button>
        </div>

        <button
          type="button"
          data-ui-action="profile"
          className={`pointer-events-auto flex h-[90px] w-[90px] shrink-0 cursor-pointer touch-manipulation items-center justify-center overflow-hidden rounded-full border-0 bg-transparent p-0 transition-transform outline-none active:scale-95 ${
            currentAvatarId !== "default"
              ? "border-[3px] border-white bg-[#fff6e9] p-1.5 shadow-sm"
              : ""
          }`}
        >
          <div className="flex h-full w-full items-center justify-center">
            {AvatarComponent && <AvatarComponent />}
          </div>
        </button>
      </div>
    </div>
  );
};
