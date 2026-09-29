import { clsx } from "clsx";

const BASE = "w-full text-white flex items-center justify-center border-none uppercase tracking-wide active:scale-95 transition-transform duration-100 ease-out outline-none rounded-full cursor-pointer shadow-md font-black touch-manipulation whitespace-nowrap px-4 h-[50px] text-[14px]";

export const ScannerBottomControls = ({ mode, digitalCode, setMode, onSubmit }: { mode: "qr" | "code"; digitalCode: string; setMode: (m: "qr" | "code") => void; onSubmit: () => void }) => {
  const isQr = mode === "qr";
  return (
    <div className={clsx("pointer-events-auto z-50 flex w-full flex-col select-none", !isQr && "gap-3")}>
      <button type="button" onClick={() => setMode(isQr ? "code" : "qr")} className={clsx(BASE, "bg-gradient-to-b from-[#ff9800] to-[#f57c00]")}>
        {isQr ? "Ввести вручную" : "Камера"}
      </button>
      {!isQr && (
        <button type="button" disabled={!digitalCode.trim()} onClick={onSubmit} className={clsx(BASE, "bg-gradient-to-b from-[#81c714] to-[#60aa05] disabled:scale-100 disabled:opacity-40")}>ОК</button>
      )}
    </div>
  );
};
