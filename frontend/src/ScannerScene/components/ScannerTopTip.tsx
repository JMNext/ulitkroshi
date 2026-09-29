import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { useEffect } from "react";

const MAP = { code: "Введите цифровой\nкод игрушки", err: "Разреши использование\nкамеры в настройках!", aim: "Наведи QR-код\nна игрушку", req: "Разрешите использование\nкамеры" };

export const ScannerTopTip = ({ mode, cameraError, isScanning }: { mode: "qr" | "code"; cameraError: string | null; isScanning: boolean }) => {
  const setAlert = useMainGameStore((s) => s.setAlertText);
  const txt = mode === "code" ? MAP.code : cameraError ? MAP.err : isScanning ? MAP.aim : MAP.req;

  useEffect(() => { if (!cameraError && (mode !== "qr" || isScanning)) setAlert(txt.replace("\n", " ")); }, [txt, setAlert, cameraError, mode, isScanning]);

  return (
    <div className="z-50 box-border flex w-full max-w-[340px] shrink-0 items-center justify-center rounded-[20px] border-4 border-solid border-white bg-white p-3 text-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] select-none">
      <div className="flex min-h-[48px] items-center justify-center">
        <p className="m-0 text-[16px] leading-snug font-black tracking-wide whitespace-pre-line text-slate-800 uppercase antialiased">{txt}</p>
      </div>
    </div>
  );
};
