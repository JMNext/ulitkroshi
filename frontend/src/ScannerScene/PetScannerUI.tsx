import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { useEffect, useRef, useState } from "react";
import { ScannerBottomControls } from "./components/ScannerBottomControls";
import { ScannerTopTip } from "./components/ScannerTopTip";
import { ScannerViewArea } from "./components/ScannerViewArea";
import { ScannerScene } from "./ScannerScene";
import { useScannerStore } from "./store/useScannerStore";

export const PetScannerUI = ({ phaserScene, shouldAutoStartCamera = true }: { phaserScene: ScannerScene; shouldAutoStartCamera?: boolean }) => {
  const [mode, setMode] = useState<"qr" | "code">("qr");
  const [digitalCode, setDigitalCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitRef = useRef(false);
  const [scale, setScale] = useState(1);

  const addPet = useMainGameStore((s) => s.addPetByCode);
  const setAlert = useMainGameStore((s) => s.setAlertText);
  const { cameraError, qrScanner, initScanner, safelyStopScanner } = useScannerStore();

  const handleClose = async () => { isInitRef.current = false; await safelyStopScanner(); setAlert(""); phaserScene.events.emit("scanner_close"); };
  const handleSuccess = async (code: string) => { if (addPet(code)) await handleClose(); };

  useEffect(() => {
    const resize = () => {
      if (!phaserScene?.scale) return;
      const w = Number(phaserScene.scale.width), h = Number(phaserScene.scale.height), isVert = h > w;
      const el = document.querySelector(".phaser-ui-root-container");
      const ps = el ? parseFloat(getComputedStyle(el).getPropertyValue("--game-scale")) || 1 : 1;
      setScale(isVert ? (w >= 768 ? Math.max(ps * 1.25, (w * 0.52) / 340) : (w * 0.82) / 340) : (w >= 1024 && h >= 768 ? Math.min(1.0, Math.max(ps * 1.3, (w * 0.48) / 340)) : Math.max(0.5, Math.min(ps, (h * 0.85) / 640))));
    };
    phaserScene.scale.on("resize", resize); resize();
    return () => { phaserScene.scale.off("resize", resize); };
  }, [phaserScene]);

  useEffect(() => {
    let cur = true;
    if (mode !== "qr" || !shouldAutoStartCamera) { isInitRef.current = false; safelyStopScanner(); if (mode === "code") setTimeout(() => cur && inputRef.current?.focus(), 50); return; }
    if (isInitRef.current || qrScanner?.isScanning) return;

    const timer = setTimeout(() => {
      if (cur && document.getElementById("add-pet-qr-container")) { isInitRef.current = true; initScanner("add-pet-qr-container", (text) => cur && handleSuccess(text)); }
    }, 150);

    return () => { cur = false; clearTimeout(timer); if (isInitRef.current) { isInitRef.current = false; safelyStopScanner(); } };
  }, [mode, shouldAutoStartCamera, qrScanner]);

  const trimmed = digitalCode.trim();

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 box-border flex items-center justify-center bg-transparent select-none">
      <div className="pointer-events-auto fixed top-0 left-0 z-50 flex origin-top-left flex-col p-[16px_20px] landscape:p-[24px_48px]">
        <button type="button" onClick={() => { (document.activeElement as HTMLElement)?.blur?.(); handleClose(); }} className="flex cursor-pointer items-center gap-1 border-none bg-transparent p-1 font-sans text-2xl font-black text-white uppercase drop-shadow-[0_3px_5px_rgba(0,0,0,0.8)] transition-transform duration-100 ease-out outline-none hover:scale-105 active:scale-95">
          <span className="relative top-[-1.5px] text-[26px]">‹</span> Назад
        </button>
      </div>

      <div className="pointer-events-none box-border flex h-auto w-full max-w-[340px] origin-center flex-col items-center justify-center gap-4 pt-12 sm:pt-0" style={{ transform: `scale(${scale})` }}>
        <div className="pointer-events-auto flex w-full shrink-0 justify-center">
          {mode === "qr" && <ScannerTopTip mode={mode} cameraError={cameraError} isScanning={!!qrScanner?.isScanning} />}
        </div>
        <div className="pointer-events-auto shrink-0">
          <ScannerViewArea mode={mode} digitalCode={digitalCode} inputRef={inputRef} setDigitalCode={setDigitalCode} onKeyDown={(e) => e.key === "Enter" && trimmed && handleSuccess(trimmed)} />
        </div>
        <div className="pointer-events-auto flex w-full shrink-0 justify-center">
          <ScannerBottomControls mode={mode} digitalCode={digitalCode} setMode={setMode} onSubmit={() => trimmed && handleSuccess(trimmed)} />
        </div>
      </div>
    </div>
  );
};
