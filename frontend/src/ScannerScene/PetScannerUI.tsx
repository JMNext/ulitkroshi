import { CloseButton } from "@/CloseButton/CloseButton";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import * as Dialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import React, { useEffect, useRef, useState } from "react";
import { ScannerBottomControls } from "./components/ScannerBottomControls";
import { ScannerTopTip } from "./components/ScannerTopTip";
import { ScannerViewArea } from "./components/ScannerViewArea";
import { useScannerStore } from "./store/useScannerStore";

interface PetScannerUIProps {
  shouldAutoStartCamera?: boolean;
  onCloseCallback?: () => void;
}

export const PetScannerUI = NiceModal.create(({ shouldAutoStartCamera, onCloseCallback }: PetScannerUIProps) => {
  const modal = useModal();
  const [mode, setMode] = useState<"qr" | "code">("qr");
  const [digitalCode, setDigitalCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitializingRef = useRef(false);

  const addPetByCode = useMainGameStore((s) => s.addPetByCode);
  const setAlertText = useMainGameStore((s) => s.setAlertText);
  const { cameraError, qrScanner, initScanner, safelyStopScanner } = useScannerStore();

  const handleClose = async () => {
    isInitializingRef.current = false;
    await safelyStopScanner();
    setAlertText("");
    modal.hide();
    onCloseCallback?.();
  };

  const handleSuccess = async (code: string) => {
    if (addPetByCode(code)) await handleClose();
  };

  useEffect(() => {
    let isCurrent = true;

    if (mode !== "qr" || !shouldAutoStartCamera) {
      isInitializingRef.current = false;
      safelyStopScanner();
      if (mode === "code") {
        setTimeout(() => isCurrent && inputRef.current?.focus(), 50);
      }
      return;
    }

    const isAlreadyScanning = !!useScannerStore.getState().qrScanner?.isScanning;
    if (isInitializingRef.current || isAlreadyScanning) return;

    const timer = setTimeout(() => {
      const container = document.getElementById("add-pet-qr-container");
      if (!isCurrent || !container) return;

      isInitializingRef.current = true;
      initScanner("add-pet-qr-container", (text) => {
        if (isCurrent) handleSuccess(text);
      });
    }, 150);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
      if (isInitializingRef.current) {
        isInitializingRef.current = false;
        safelyStopScanner();
      }
    };
  }, [mode, shouldAutoStartCamera]);

  const isQr = mode === "qr";
  const trimmedCode = digitalCode.trim();
  const isScanning = !!qrScanner?.isScanning;

  return (
    <Dialog.Root open={modal.visible} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="pointer-events-auto fixed inset-0 z-50 box-border flex items-center justify-center outline-none">
          <div className="absolute inset-0 box-border h-full w-full">
            <Dialog.Close asChild>
              <CloseButton className="pointer-events-auto !absolute top-[30px] right-[30px] z-50 !h-[44px] !w-[44px] text-[18px] sm:!h-[54px] sm:!w-[54px] sm:text-[24px] [@media(orientation:landscape)]:[@media(max-height:500px)]:top-[20px] [@media(orientation:landscape)]:[@media(max-height:500px)]:right-[20px]" />
            </Dialog.Close>

            <Dialog.Title className="sr-only">Сканер питомцев</Dialog.Title>

            <div
              className={clsx(
                "absolute box-border flex flex-col items-center bg-transparent",
                isQr
                  ? "top-0 bottom-0 h-full w-full max-w-[430px] left-1/2 -translate-x-1/2 justify-between p-4 pt-20 pb-6 [@media(orientation:landscape)]:[@media(max-height:500px)]:left-0 [@media(orientation:landscape)]:[@media(max-height:500px)]:translate-x-0 [@media(orientation:landscape)]:[@media(max-height:500px)]:max-w-full [@media(orientation:landscape)]:[@media(max-height:500px)]:w-full [@media(orientation:landscape)]:[@media(max-height:500px)]:flex-row [@media(orientation:landscape)]:[@media(max-height:500px)]:px-12 [@media(orientation:landscape)]:[@media(max-height:500px)]:justify-between"
                  : "top-1/2 left-1/2 w-full max-w-[440px] -translate-x-1/2 -translate-y-1/2 justify-center gap-6 p-4 max-sm:gap-4"
              )}
            >
              <div className={clsx("flex flex-col items-center justify-center", isQr ? "mt-[20px] w-full [@media(orientation:landscape)]:[@media(max-height:500px)]:mt-0 [@media(orientation:landscape)]:[@media(max-height:500px)]:w-[220px]" : "w-full")}>
                {isQr && <ScannerTopTip mode={mode} cameraError={cameraError} isScanning={isScanning} />}
              </div>

              <div className={clsx("flex flex-col items-center justify-center", isQr ? "min-h-0 w-full min-w-0 flex-1 py-2 [@media(orientation:landscape)]:[@media(max-height:500px)]:w-auto" : "w-full")}>
                <ScannerViewArea
                  mode={mode}
                  digitalCode={digitalCode}
                  inputRef={inputRef}
                  setDigitalCode={setDigitalCode}
                  onKeyDown={(e) => e.key === "Enter" && trimmedCode && handleSuccess(trimmedCode)}
                />
              </div>

              <div className={clsx("flex flex-col items-center justify-center", isQr ? "w-full shrink-0 [@media(orientation:landscape)]:[@media(max-height:500px)]:w-[220px]" : "w-full")}>
                <ScannerBottomControls
                  mode={mode}
                  digitalCode={digitalCode}
                  setMode={setMode}
                  onSubmit={() => trimmedCode && handleSuccess(trimmedCode)}
                />
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
