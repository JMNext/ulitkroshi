import { CloseButton } from "@/ModalWrapper/CloseButton";
import * as Dialog from "@radix-ui/react-dialog";
import { HELP_SECTIONS } from "./constants/helpModal.constants";

interface HelpModalProps {
  onClose: () => void;
}

const LANDSCAPE_MEDIA = "max-[550px]:landscape";

export const HelpModal = ({ onClose }: HelpModalProps) => {
  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />

        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none">
          <div
            className={`relative box-border flex h-auto max-h-[90vh] w-[520px] origin-center flex-col items-center rounded-[32px] border-[4px] border-[#ffca28] bg-white p-6 max-sm:m-2 max-sm:w-[330px] max-sm:scale-90 max-sm:p-4 ${LANDSCAPE_MEDIA}:scale-100 ${LANDSCAPE_MEDIA}:max-h-[320px] ${LANDSCAPE_MEDIA}:p-3 shadow-2xl`}
          >
            <Dialog.Close asChild>
              <CloseButton className="absolute top-3 right-3 z-30" />
            </Dialog.Close>

            <Dialog.Title
              className={`mt-2 mb-4 shrink-0 text-center text-[22px] font-black tracking-wide text-[#1a3d1c] uppercase antialiased select-none ${LANDSCAPE_MEDIA}:mt-0 ${LANDSCAPE_MEDIA}:mb-2 ${LANDSCAPE_MEDIA}:text-[18px]`}
            >
              Как играть
            </Dialog.Title>

            <div
              className={`flex w-full max-w-[460px] flex-col gap-4 overflow-y-auto text-[15px] leading-relaxed font-medium text-[#1a3d1c] antialiased select-none ${LANDSCAPE_MEDIA}:gap-2 ${LANDSCAPE_MEDIA}:text-[13px] ${LANDSCAPE_MEDIA}:leading-normal [&::-webkit-scrollbar]:hidden`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {HELP_SECTIONS.map((section) => (
                <div
                  key={section.id}
                  className={`flex shrink-0 flex-col gap-1 rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc] p-3 ${LANDSCAPE_MEDIA}:p-2 ${LANDSCAPE_MEDIA}:rounded-[12px]`}
                >
                  <span className={`text-[16px] font-black text-[#ff9800] ${LANDSCAPE_MEDIA}:text-[14px]`}>{section.title}</span>
                  <p>{section.text}</p>
                </div>
              ))}
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className={`pointer-events-auto m-0 mx-auto mt-4 flex h-[46px] w-full max-w-[400px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-[24px] border-0 bg-[#ff9800] p-0 text-[15px] font-black tracking-wide text-white uppercase shadow-sm transition-transform outline-none select-none active:scale-[0.98] ${LANDSCAPE_MEDIA}:mt-2 ${LANDSCAPE_MEDIA}:h-[34px] ${LANDSCAPE_MEDIA}:text-[13px]`}
              >
                Понятно
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
