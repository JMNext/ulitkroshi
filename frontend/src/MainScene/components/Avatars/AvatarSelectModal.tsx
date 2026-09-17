import { CloseButton } from "@/CloseButton/CloseButton";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import * as Dialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { AVAILABLE_AVATARS, AvatarId } from "./Avatars";

export const AvatarSelectModal = NiceModal.create(() => {
  const modal = useModal();
  const { avatarId = "frog", setAvatarId } = useMainGameStore();

  return (
    <Dialog.Root open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />

        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none">
          <div className="relative box-border flex h-auto w-[380px] origin-center flex-col items-center rounded-[32px] border-[4px] border-[#ffca28] bg-white p-6 shadow-2xl max-sm:m-2 max-sm:w-[330px] max-sm:scale-95 max-sm:rounded-[24px] max-sm:p-4 landscape:scale-95 [@media(orientation:landscape)_and_(max-height:500px)]:w-[330px]">
            <Dialog.Close asChild>
              <CloseButton className="absolute top-3 right-3" />
            </Dialog.Close>

            <Dialog.Title className="mt-4 mb-4 shrink-0 pt-4 text-center text-[22px] font-black tracking-wide text-[#1a3d1c] uppercase antialiased select-none">
              Выбор Аватара
            </Dialog.Title>

            <div
              className="mb-2 grid max-h-[40vh] w-full max-w-[280px] grid-cols-3 gap-3 overflow-x-visible overflow-y-auto p-1.5 select-none [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {AVAILABLE_AVATARS.map((avatar) => {
                const isSelected = avatar.id === avatarId;
                const IconComponent = avatar.Component;

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setAvatarId(avatar.id as AvatarId)}
                    className={clsx(
                      "relative aspect-square cursor-pointer overflow-visible rounded-[20px] border-2 bg-[#f1f5f9] p-1.5 transition-transform outline-none active:scale-95",
                      isSelected ? "z-10 scale-105 border-[#81c714] bg-[#f0fdf4] shadow-md" : "border-transparent hover:border-[#cbd5e1]"
                    )}
                  >
                    <div className="h-full w-full overflow-hidden rounded-[14px]">
                      <IconComponent />
                    </div>

                    {isSelected && (
                      <div className="absolute right-0.5 bottom-0.5 z-20 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#81c714] text-[11px] font-black text-white shadow-sm">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
