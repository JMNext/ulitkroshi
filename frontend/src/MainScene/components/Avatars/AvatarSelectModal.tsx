import * as Dialog from "@radix-ui/react-dialog";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { CloseButton } from "@/ModalWrapper/CloseButton";
import { AVAILABLE_AVATARS, AvatarId } from "./Avatars";

interface AvatarSelectModalProps {
  onClose: () => void;
}

export const AvatarSelectModal = ({ onClose }: AvatarSelectModalProps) => {
  const { avatarId, setAvatarId } = useMainGameStore();
  const currentAvatarId = avatarId || "frog";

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none">
          <div className="box-border relative bg-white border-[4px] border-[#ffca28] rounded-[32px] max-sm:rounded-[24px] p-6 max-sm:p-4 max-sm:m-2 w-[380px] max-sm:w-[330px] [@media(orientation:landscape)_and_(max-height:500px)]:w-[330px] h-auto flex flex-col items-center max-sm:scale-95 origin-center landscape:scale-95 shadow-2xl">
            
            <Dialog.Close asChild>
              <CloseButton className="absolute top-3 right-3" />
            </Dialog.Close>

            <Dialog.Title className="mt-4 pt-4 mb-4 text-center text-[22px] font-black tracking-wide text-[#1a3d1c] uppercase antialiased select-none shrink-0">
              Выбор Аватара
            </Dialog.Title>

            <div 
              className="mb-2 grid w-full max-w-[280px] grid-cols-3 gap-3 p-1.5 select-none overflow-y-auto overflow-x-visible max-h-[40vh] [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {AVAILABLE_AVATARS.map((avatar) => {
                const isSelected = avatar.id === currentAvatarId;
                const IconComponent = avatar.Component;

                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setAvatarId?.(avatar.id as AvatarId)}
                    className={`relative aspect-square cursor-pointer rounded-[20px] border-2 bg-[#f1f5f9] p-1.5 transition-transform outline-none active:scale-95 overflow-visible ${
                      isSelected
                        ? "scale-105 border-[#81c714] bg-[#f0fdf4] shadow-md z-10"
                        : "border-transparent hover:border-[#cbd5e1]"
                    }`}
                  >
                    <div className="h-full w-full overflow-hidden rounded-[14px]">
                      <IconComponent />
                    </div>

                    {isSelected && (
                      <div className="absolute right-0.5 bottom-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#81c714] text-[11px] font-black text-white shadow-sm z-20">
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
};
