import React, { memo } from "react";
import phoneImgUrl from "../../../assets/interface-icons/phone.svg";
import { useScannerStore } from "./store/useScannerStore";

interface ScannerViewAreaProps {
  mode: "qr" | "code";
  digitalCode: string;
  cameraError: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setDigitalCode: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const ScannerViewArea = memo(({ mode, digitalCode, inputRef, setDigitalCode, onKeyDown }: ScannerViewAreaProps) => {
  const { qrScanner } = useScannerStore();
  const isScanning = !!qrScanner?.isScanning;

  if (mode === "qr") {
    return (
      <div className="animate-fade-in pointer-events-auto relative flex h-full max-h-[500px] w-full max-w-[310px] items-center justify-center sm:max-h-[540px] [@media(orientation:landscape)_and_(max-height:500px)]:h-[310px] [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[210px]">
        <img src={phoneImgUrl} className="pointer-events-none absolute inset-0 z-20 block h-full w-full object-contain" alt="" />

        {/* Чёрный фон внутри контура телефона включается ТОЛЬКО тогда, когда пошла трансляция камеры. До этого момента всё прозрачно */}
        <div
          className={`absolute top-[3%] right-[5%] bottom-[4%] left-[5%] z-10 box-border flex items-center justify-center overflow-hidden rounded-[36px] sm:rounded-[42px] ${isScanning ? "bg-black" : "bg-transparent"}`}
        >
          <div id="add-pet-qr-container" className="h-full w-full [&_video]:!h-full [&_video]:!w-full [&_video]:object-cover" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pointer-events-auto flex w-full max-w-[440px] shrink-0 flex-col items-center px-4 sm:max-w-[540px] [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[340px]">
      <input
        ref={inputRef}
        type="text"
        maxLength={15}
        value={digitalCode}
        onChange={(e) => setDigitalCode(e.target.value.replace(/[^a-zA-Zа-яА-Я0-9]/g, "").toUpperCase())}
        onKeyDown={onKeyDown}
        placeholder="ВВЕДИТЕ КОД ИГРУШКИ"
        className="box-border h-[56px] w-full rounded-2xl border-[4px] border-[rgb(129,199,20)] bg-white px-6 text-center text-[18px] font-black tracking-wide text-[#065f46] uppercase placeholder-slate-300 shadow-xl outline-none focus:border-[#60aa05] sm:h-[64px] sm:rounded-[32px] sm:text-[24px] [@media(orientation:landscape)_and_(max-height:500px)]:h-[54px]"
      />
    </div>
  );
});
