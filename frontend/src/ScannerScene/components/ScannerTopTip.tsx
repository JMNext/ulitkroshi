import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { memo, useEffect } from "react";

interface ScannerTopTipProps {
  mode: "qr" | "code";
  cameraError: string | null;
  isScanning: boolean;
}

const MESSAGES = {
  enterCode: "Введите цифровой\nкод игрушки",
  allowCameraSettings: "Разреши использование\nкамеры в настройках!",
  aimAtQr: "Наведи QR-код\nна игрушку",
  requestCamera: "Разрешите использование\nкамеры"
};

export const ScannerTopTip = memo(({ mode, cameraError, isScanning }: ScannerTopTipProps) => {
  const setAlertText = useMainGameStore((s) => s.setAlertText);

  const textStr =
    mode === "code"
      ? MESSAGES.enterCode
      : cameraError
        ? MESSAGES.allowCameraSettings
        : isScanning
          ? MESSAGES.aimAtQr
          : MESSAGES.requestCamera;

  useEffect(() => {
    if (cameraError || (mode === "qr" && !isScanning)) {
      return;
    }

    setAlertText(textStr.replace("\n", " "));
  }, [textStr, setAlertText, cameraError, mode, isScanning]);

  return (
    <div className="z-50 mx-auto mt-2 box-border flex w-full max-w-[300px] shrink-0 items-center justify-center rounded-[20px] border-4 border-solid border-white bg-white p-3 text-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] select-none sm:max-w-[340px] [@media(orientation:landscape)_and_(max-height:500px)]:mt-0 [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[200px]">
      <div className="flex min-h-[48px] items-center justify-center sm:min-h-[60px] [@media(orientation:landscape)_and_(max-height:500px)]:min-h-[42px]">
        <p className="m-0 text-[16px] leading-snug font-black tracking-wide whitespace-pre-line text-slate-800 uppercase antialiased sm:text-[20px] [@media(orientation:landscape)_and_(max-height:500px)]:text-[14px]">
          {textStr}
        </p>
      </div>
    </div>
  );
});
