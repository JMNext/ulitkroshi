import { AVAILABLE_AVATARS } from "@/MainScene/components/ProfileEdit/components/Avatars";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import NiceModal from "@ebay/nice-modal-react";
import { clsx } from "clsx";

interface HeaderAvatarProps {
  isVert?: boolean;
}

export const HeaderAvatar = ({ isVert }: HeaderAvatarProps) => {
  const id = useMainGameStore((s) => s.avatarId ?? "default");
  const Avatar = AVAILABLE_AVATARS.find((a) => a.id === id)?.Component;

  return (
    <button
      type="button"
      data-ui-action="profile"
      onClick={() => NiceModal.show("profile-modal")}
      className={clsx(
        "pointer-events-auto flex shrink-0 cursor-pointer touch-manipulation items-center justify-center overflow-hidden rounded-full border-0 bg-transparent p-0 transition-transform duration-150 outline-none active:scale-95",
        isVert ? "h-[64px] w-[64px]" : "h-[94px] w-[94px]",
        id !== "default" && "border-2 border-white bg-gradient-to-b from-white to-[#FFF6E9] p-1 shadow-[0px_4px_20px_0px_rgba(152,158,144,0.35)]"
      )}
      aria-label="Профиль"
    >
      {Avatar && <Avatar />}
    </button>
  );
};
