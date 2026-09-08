import { useEffect, useState, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { useScannerStore } from "./store/useScannerStore";
import { ScannerTopTip } from "./ScannerTopTip";
import { ScannerBottomControls } from "./ScannerBottomControls";
import { ScannerViewArea } from "./ScannerViewArea";
import { CloseButton } from "@/ModalWrapper/CloseButton";

interface AddPetScannerModalProps {
  onClose: () => void;
}

export const AddPetScannerModal = ({ onClose }: AddPetScannerModalProps) => {
  const [mode, setMode] = useState<"qr" | "code">("qr");
  const [digitalCode, setDigitalCode] = useState("");
  
  const inputRef = useRef<HTMLInputElement>(null);
  const addPetByCode = useMainGameStore((s) => s.addPetByCode);
  const { cameraError, initScanner, safelyStopScanner } = useScannerStore();

  const handleClose = async () => {
    await safelyStopScanner();
    onClose();
  };

  const handleSuccess = async (code: string) => {
    if (addPetByCode?.(code)) {
      await handleClose();
    }
  };

  useEffect(() => {
    let isCurrentEffect = true;

    if (mode !== "qr") {
      safelyStopScanner();
      return;
    }

    const timer = setTimeout(() => {
      if (!isCurrentEffect || !document.getElementById("add-pet-qr-container")) return;
      initScanner("add-pet-qr-container", (text) => {
        if (isCurrentEffect) handleSuccess(text);
      });
    }, 150);

    return () => {
      isCurrentEffect = false;
      clearTimeout(timer);
      safelyStopScanner();
    };
  }, [mode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && digitalCode.trim()) {
      handleSuccess(digitalCode.trim());
    }
  };

  const isQr = mode === "qr";
  const trimmedCode = digitalCode.trim();

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        
        <Dialog.Content className="fixed inset-0 z-50 outline-none pointer-events-none box-border flex items-center justify-center">
          <div className="absolute inset-0 w-full h-full pointer-events-none box-border">
            <Dialog.Close asChild>
              <CloseButton 
                className="!absolute top-[30px] right-[30px] [@media(orientation:landscape)_and_(max-height:500px)]:top-[20px] [@media(orientation:landscape)_and_(max-height:500px)]:right-[20px] !w-[44px] !h-[44px] sm:!w-[54px] sm:!h-[54px] text-[18px] sm:text-[24px] pointer-events-auto z-50" 
              />
            </Dialog.Close>

            <Dialog.Title className="sr-only">Сканер питомцев</Dialog.Title>

            {isQr ? (
              <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-full h-full max-w-[430px] [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[800px] flex flex-col [@media(orientation:landscape)_and_(max-height:500px)]:flex-row items-center justify-between p-4 pt-20 [@media(orientation:landscape)_and_(max-height:500px)]:p-6 box-border bg-transparent pointer-events-none">
                <div className="w-full shrink-0 flex flex-col items-center justify-center mt-[20px] [@media(orientation:landscape)_and_(max-height:500px)]:w-[200px] [@media(orientation:landscape)_and_(max-height:500px)]:mt-0">
                  <ScannerTopTip mode={mode} />
                </div>

                <div className="w-full flex flex-col items-center justify-center min-h-0 min-w-0 flex-1 py-2 [@media(orientation:landscape)_and_(max-height:500px)]:w-auto">
                  <ScannerViewArea
                    mode={mode}
                    digitalCode={digitalCode}
                    cameraError={cameraError}
                    inputRef={inputRef}
                    setDigitalCode={setDigitalCode}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                <div className="w-full shrink-0 flex flex-col items-center justify-center [@media(orientation:landscape)_and_(max-height:500px)]:w-[200px]">
                  <ScannerBottomControls
                    mode={mode}
                    digitalCode={digitalCode}
                    setMode={setMode}
                    onSubmit={() => trimmedCode && handleSuccess(trimmedCode)}
                  />
                </div>
              </div>
            ) : (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[440px] flex flex-col items-center justify-center gap-6 max-sm:gap-4 p-4 box-border bg-transparent pointer-events-none">
                <ScannerTopTip mode={mode} />
                <ScannerViewArea
                  mode={mode}
                  digitalCode={digitalCode}
                  cameraError={cameraError}
                  inputRef={inputRef}
                  setDigitalCode={setDigitalCode}
                  onKeyDown={handleKeyDown}
                />
                <ScannerBottomControls
                  mode={mode}
                  digitalCode={digitalCode}
                  setMode={setMode}
                  onSubmit={() => trimmedCode && handleSuccess(trimmedCode)}
                />
              </div>
            )}

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
