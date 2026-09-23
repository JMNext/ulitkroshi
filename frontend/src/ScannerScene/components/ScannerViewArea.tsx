import { clsx } from "clsx";
import React from "react";
import phoneImgUrl from "../../assets/interface-icons/phone.svg";
import { useScannerStore } from "../store/useScannerStore";

export const ScannerViewArea = ({ mode, digitalCode, inputRef, setDigitalCode, onKeyDown }: { mode: "qr" | "code"; digitalCode: string; inputRef: React.RefObject<HTMLInputElement | null>; setDigitalCode: (v: string) => void; onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void }) => {
  const isQr = mode === "qr";
  return isQr ? (
    <div className="pointer-events-auto relative flex h-[500px] w-[310px] shrink-0 items-center justify-center">
      <img src={phoneImgUrl} className="pointer-events-none absolute inset-0 z-20 block h-full w-full object-contain" alt="" />
      <div className={clsx("absolute top-[3.6%] right-[6.6%] bottom-[4.6%] left-[6.6%] z-10 box-border flex items-center justify-center overflow-hidden rounded-[36px]", !!useScannerStore((s) => s.qrScanner?.isScanning) ? "bg-black" : "bg-transparent")}>
        <div id="add-pet-qr-container" className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:rounded-[32px] [&_video]:object-cover" />
      </div>
    </div>
  ) : (
    <div className="pointer-events-auto flex w-[340px] shrink-0 flex-col items-center">
      <input ref={inputRef} type="text" maxLength={15} value={digitalCode} onChange={(e) => setDigitalCode(e.target.value.replace(/[^a-zA-Zа-яА-Я0-9]/g, "").toUpperCase())} onKeyDown={onKeyDown} placeholder="ВВЕДИТЕ КОД ИГРУШКИ" className="box-border h-[56px] w-full rounded-2xl border-[4px] border-[rgb(129,199,20)] bg-white px-6 text-center text-[18px] font-black tracking-wide text-[#065f46] uppercase placeholder-slate-300 shadow-xl outline-none focus:border-[#60aa05]" />
    </div>
  );
};
