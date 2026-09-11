import { memo } from "react";

interface ScannerBottomControlsProps {
  mode: "qr" | "code";
  digitalCode: string;
  setMode: (mode: "qr" | "code") => void;
  onSubmit: () => void;
}

const BTN_BASE =
  "w-full text-white flex items-center justify-center border-none uppercase tracking-wide active:scale-95 transition-transform duration-100 ease-out outline-none rounded-full cursor-pointer shadow-md font-black touch-manipulation whitespace-nowrap px-4 [@media(orientation:landscape)_and_(max-height:500px)]:h-[46px] [@media(orientation:landscape)_and_(max-height:500px)]:text-[13px]";
const BTN_ORANGE = `${BTN_BASE} bg-gradient-to-b from-[#ff9800] to-[#f57c00]`;

export const ScannerBottomControls = memo(({ mode, digitalCode, setMode, onSubmit }: ScannerBottomControlsProps) => {
  if (mode === "qr") {
    return (
      <div className="pointer-events-auto z-50 mx-auto mt-auto mb-[74px] flex w-full max-w-[280px] shrink-0 flex-col pt-2 pb-6 select-none sm:pb-2 [@media(orientation:landscape)_and_(max-height:500px)]:mb-0 [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[200px]">
        <button type="button" onClick={() => setMode("code")} className={`${BTN_ORANGE} h-[50px] text-[15px]`}>
          Ввести код вручную
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto z-50 mx-auto mt-5 flex w-full max-w-[340px] shrink-0 flex-row gap-4 px-4 select-none sm:max-w-[540px] sm:px-0 [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[200px] [@media(orientation:landscape)_and_(max-height:500px)]:flex-col [@media(orientation:landscape)_and_(max-height:500px)]:gap-2.5">
      <button
        type="button"
        onClick={() => setMode("qr")}
        className={`${BTN_ORANGE} h-[52px] flex-1 text-[14px] sm:h-[64px] sm:text-[16px] [@media(orientation:landscape)_and_(max-height:500px)]:w-full`}
      >
        Включить камеру
      </button>
      <button
        type="button"
        disabled={!digitalCode.trim()}
        onClick={onSubmit}
        className={`${BTN_BASE} h-[52px] flex-1 bg-gradient-to-b from-[#81c714] to-[#60aa05] text-[14px] disabled:scale-100 disabled:opacity-40 sm:h-[64px] sm:text-[16px] [@media(orientation:landscape)_and_(max-height:500px)]:w-full`}
      >
        Подтвердить
      </button>
    </div>
  );
});
