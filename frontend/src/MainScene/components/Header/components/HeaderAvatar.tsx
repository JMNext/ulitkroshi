import { AVAILABLE_AVATARS } from "@/MainScene/components/ProfileEdit/components/Avatars";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import NiceModal from "@ebay/nice-modal-react";
import { clsx } from "clsx";

export const HeaderAvatar = () => {
  const id = useMainGameStore((s) => s.avatarId ?? "default");
  const Avatar = AVAILABLE_AVATARS.find((a) => a.id === id)?.Component;

  return (
    <button
      type="button"
      data-ui-action="profile"
      // ИСПРАВЛЕНО: Вызываем профиль строго по независимому текстовому ID через менеджер интерфейса
      onClick={() => NiceModal.show("profile-modal")}
      className={clsx(
        "pointer-events-auto flex h-[90px] w-[90px] shrink-0 cursor-pointer touch-manipulation items-center justify-center overflow-hidden rounded-full border-0 bg-transparent p-0 transition-all duration-150 outline-none active:scale-95",
        id !== "default" && "border-[3px] border-white bg-[#fff6e9] p-1.5 shadow-sm"
      )}
    >
      {Avatar && <Avatar />}
    </button>
  );
};
