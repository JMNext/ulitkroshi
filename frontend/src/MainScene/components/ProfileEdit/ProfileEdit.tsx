import { authApi } from "@/api/auth.api";
import editBtnIcon from "@/assets/interface-icons/button_edit.svg";
import avatarDefaultIcon from "@/assets/interface-icons/icon-avatar.svg";
import { CloseButton } from "@/CloseButton/CloseButton";
import { AVAILABLE_AVATARS } from "@/MainScene/components/Avatars/Avatars";
import { AvatarSelectModal } from "@/MainScene/components/Avatars/AvatarSelectModal";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import * as Dialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";

interface CustomWindow extends Window {
  phaserGame: any;
}

export const ProfileEdit = NiceModal.create(() => {
  const modal = useModal();
  const { username, avatarId, userId, setUsername, startScanner, resetStore } = useMainGameStore();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleLogout = async () => {
    modal.hide();
    await authApi.logout();
    await resetStore();

    if (typeof window !== "undefined") {
      const customWindow = window as unknown as CustomWindow;
      if (customWindow.phaserGame) {
        const game = customWindow.phaserGame;
        game.scene.stop("MainScene");
        game.scene.start("LoginScene");
      }
    }
  };

  const currentAvatar = AVAILABLE_AVATARS.find((a) => a.id === avatarId) || {
    Component: () => <img src={avatarDefaultIcon} className="block h-full w-full rounded-full object-cover" alt="Default Avatar" />
  };
  const AvatarComponent = currentAvatar.Component;

  return (
    <Dialog.Root open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none">
          <div className="relative box-border flex h-auto w-[380px] flex-col items-center rounded-[32px] border-[4px] border-[#ffca28] bg-white p-6 shadow-2xl max-sm:w-[330px] max-sm:rounded-[24px] max-sm:p-4 landscape:scale-95">
            <Dialog.Close asChild>
              <CloseButton className="absolute top-3 right-3" />
            </Dialog.Close>
            <Dialog.Title className="sr-only">Профиль</Dialog.Title>

            {userId && (
              <div className="mt-4 text-center text-[14px] font-black tracking-wider text-slate-400/80 uppercase select-none">
                ID: {userId}
              </div>
            )}

            <div
              onClick={() => NiceModal.show(AvatarSelectModal)}
              className={clsx(
                "pointer-events-auto relative mx-auto mt-4 h-[105px] w-[105px] cursor-pointer rounded-full bg-white shadow-sm transition-transform hover:scale-105 active:scale-95",
                !avatarId || avatarId === "default" ? "border-0 p-0" : "border-2 border-[#e2e8f0] p-1"
              )}
            >
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                <AvatarComponent />
              </div>
            </div>

            <div className="relative mx-auto mt-4 flex h-[34px] w-full max-w-[280px] items-center justify-center font-black">
              {!isEditing ? (
                <div className="flex w-full items-center justify-center gap-2">
                  <span
                    onClick={() => setIsEditing(true)}
                    className="max-w-[180px] cursor-pointer overflow-hidden text-[21px] text-ellipsis whitespace-nowrap text-[#1a3d1c]"
                  >
                    {username}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex h-8 w-8 items-center justify-center border-0 bg-transparent p-0 active:scale-90"
                  >
                    <img src={editBtnIcon} className="h-6 w-6 object-contain" alt="" />
                  </button>
                </div>
              ) : (
                <div className="flex w-full items-center justify-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    maxLength={20}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
                    onBlur={() => setIsEditing(false)}
                    className="box-border h-[34px] w-full max-w-[180px] rounded-[12px] border-2 border-[#e2e8f0] bg-[#f8fafc] text-center text-[17px] font-black text-[#1a3d1c] outline-none focus:border-[#81c714]"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                modal.hide();
                startScanner();
              }}
              className="mx-auto mt-6 flex h-[48px] w-full max-w-[280px] cursor-pointer items-center justify-center rounded-[24px] border-0 bg-[#ff9800] text-[15px] font-black text-white uppercase shadow-sm active:scale-[0.98]"
            >
              Добавить питомца
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="mx-auto mt-3 flex h-[44px] w-full max-w-[280px] cursor-pointer items-center justify-center rounded-[24px] border-2 border-[#ef4444] bg-transparent text-[14px] font-black text-[#ef4444] uppercase shadow-sm active:scale-[0.98]"
            >
              Выйти
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
