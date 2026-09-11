import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { CloseButton } from "@/ModalWrapper/CloseButton";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import { ScannerBottomControls } from "./ScannerBottomControls";
import { ScannerTopTip } from "./ScannerTopTip";
import { ScannerViewArea } from "./ScannerViewArea";
import { useScannerStore } from "./store/useScannerStore";

interface AddPetScannerModalProps {
  onClose: () => void;
}

export const AddPetScannerModal = ({ onClose }: AddPetScannerModalProps) => {
  const [mode, setMode] = useState<"qr" | "code">("qr");
  const [digitalCode, setDigitalCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addPetByCode = useMainGameStore((s) => s.addPetByCode);
  const { cameraError, qrScanner, initScanner, safelyStopScanner } = useScannerStore();

  const handleClose = async () => {
    await safelyStopScanner();
    onClose();
  };

  const handleSuccess = async (code: string) => {
    if (addPetByCode?.(code)) await handleClose();
  };

  useEffect(() => {
    let isCurrent = true;
    if (mode !== "qr") {
      safelyStopScanner();
      return;
    }

    const timer = setTimeout(() => {
      const container = document.getElementById("add-pet-qr-container");
      if (!isCurrent || !container) return;

      initScanner("add-pet-qr-container", (text) => {
        if (isCurrent) handleSuccess(text);
      });
    }, 150);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
      safelyStopScanner();
    };
  }, [mode]);

  const isQr = mode === "qr";
  const trimmedCode = digitalCode.trim();
  const isScanning = !!qrScanner?.isScanning;

  const contentClass = isQr
    ? "absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-full h-full max-w-[430px] [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[800px] flex flex-col [@media(orientation:landscape)_and_(max-height:500px)]:flex-row items-center justify-between p-4 pt-20 [@media(orientation:landscape)_and_(max-height:500px)]:p-6"
    : "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[440px] flex flex-col items-center justify-center gap-6 max-sm:gap-4 p-4";

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="pointer-events-auto fixed inset-0 z-50 box-border flex items-center justify-center outline-none">
          <div className="absolute inset-0 box-border h-full w-full">
            <Dialog.Close asChild>
              <CloseButton className="pointer-events-auto !absolute top-[30px] right-[30px] z-50 !h-[44px] !w-[44px] text-[18px] sm:!h-[54px] sm:!w-[54px] sm:text-[24px] [@media(orientation:landscape)_and_(max-height:500px)]:top-[20px] [@media(orientation:landscape)_and_(max-height:500px)]:right-[20px]" />
            </Dialog.Close>

            <Dialog.Title className="sr-only">Сканер питомцев</Dialog.Title>

            <div className={`${contentClass} box-border bg-transparent`}>
              <div
                className={
                  isQr
                    ? "mt-[20px] flex w-full flex-col items-center justify-center [@media(orientation:landscape)_and_(max-height:500px)]:mt-0 [@media(orientation:landscape)_and_(max-height:500px)]:w-[200px]"
                    : "w-full"
                }
              >
                <ScannerTopTip mode={mode} cameraError={cameraError} isScanning={isScanning} />
              </div>

              <div
                className={
                  isQr
                    ? "flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center py-2 [@media(orientation:landscape)_and_(max-height:500px)]:w-auto"
                    : "w-full"
                }
              >
                <ScannerViewArea
                  mode={mode}
                  digitalCode={digitalCode}
                  cameraError={cameraError}
                  inputRef={inputRef}
                  setDigitalCode={setDigitalCode}
                  onKeyDown={(e) => e.key === "Enter" && trimmedCode && handleSuccess(trimmedCode)}
                />
              </div>

              <div
                className={
                  isQr
                    ? "flex w-full shrink-0 flex-col items-center justify-center [@media(orientation:landscape)_and_(max-height:500px)]:w-[200px]"
                    : "w-full"
                }
              >
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
};
