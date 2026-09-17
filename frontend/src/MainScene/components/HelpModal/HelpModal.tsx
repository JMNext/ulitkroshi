import { CloseButton } from "@/CloseButton/CloseButton";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import * as Dialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import React from "react";
import { HELP_SECTIONS } from "./constants/helpModal.constants";

export const HelpModal = NiceModal.create(() => {
  const modal = useModal();

  return (
    <Dialog.Root open={modal.visible} onOpenChange={(open) => !open && modal.hide()}>
      <Dialog.Portal container={document.body}>
        <Dialog.Overlay className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-[2px]" />

        <Dialog.Content className="fixed top-1/2 left-1/2 z-[10000] -translate-x-1/2 -translate-y-1/2 outline-none">
          <div
            className={clsx(
              "relative box-border flex h-auto max-h-[90vh] w-[520px] origin-center flex-col items-center rounded-[32px] border-[4px] border-[#ffca28] bg-white p-6 shadow-2xl",
              "max-sm:m-2 max-sm:w-[330px] max-sm:scale-90 max-sm:p-4",
              "max-[550px]:landscape:max-h-[320px] max-[550px]:landscape:scale-100 max-[550px]:landscape:p-3"
            )}
          >
            <Dialog.Close asChild>
              <CloseButton className="absolute top-3 right-3 z-30" />
            </Dialog.Close>

            <Dialog.Title
              className={clsx(
                "mt-2 mb-4 shrink-0 text-center text-[22px] font-black tracking-wide text-[#1a3d1c] uppercase antialiased select-none",
                "max-[550px]:landscape:mt-0 max-[550px]:landscape:mb-2 max-[550px]:landscape:text-[18px]"
              )}
            >
              Как играть
            </Dialog.Title>

            <div
              className={clsx(
                "flex w-full max-w-[460px] flex-col gap-4 overflow-y-auto text-[15px] leading-relaxed font-medium text-[#1a3d1c] antialiased select-none scrollbar-none",
                "max-[550px]:landscape:gap-2 max-[550px]:landscape:text-[13px] max-[550px]:landscape:leading-normal"
              )}
            >
              {HELP_SECTIONS.map((section) => (
                <div
                  key={section.id}
                  className={clsx(
                    "flex shrink-0 flex-col gap-1 rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc] p-3",
                    "max-[550px]:landscape:rounded-[12px] max-[550px]:landscape:p-2"
                  )}
                >
                  <span className={clsx("text-[16px] font-black text-[#ff9800]", "max-[550px]:landscape:text-[14px]")}>
                    {section.title}
                  </span>
                  <p>{section.text}</p>
                </div>
              ))}
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className={clsx(
                  "pointer-events-auto m-0 mx-auto mt-4 flex h-[46px] w-full max-w-[400px] shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-[24px] border-0 bg-[#ff9800] p-0 text-[15px] font-black tracking-wide text-white uppercase shadow-sm transition-transform outline-none select-none active:scale-[0.98]",
                  "max-[550px]:landscape:mt-2 max-[550px]:landscape:h-[34px] max-[550px]:landscape:text-[13px]"
                )}
              >
                Понятно
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
