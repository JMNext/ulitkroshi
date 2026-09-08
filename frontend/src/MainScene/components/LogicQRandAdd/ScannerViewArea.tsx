import { memo } from "react";
import phoneImgUrl from "../../../assets/interface-icons/phone.svg";

interface ScannerViewAreaProps {
  mode: "qr" | "code";
  digitalCode: string;
  cameraError: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setDigitalCode: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const ScannerViewArea = memo(({
  mode,
  digitalCode,
  cameraError,
  inputRef,
  setDigitalCode,
  onKeyDown
}: ScannerViewAreaProps) => {
  if (mode === "qr") {
    return (
      <div className="relative w-full max-w-[310px] [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[210px] h-full max-h-[500px] sm:max-h-[540px] [@media(orientation:landscape)_and_(max-height:500px)]:h-[310px] animate-fade-in flex items-center justify-center pointer-events-auto">
        <img src={phoneImgUrl} className="pointer-events-none absolute inset-0 z-20 h-full w-full object-contain block" alt="" />
        <div className="absolute top-[3%] left-[5%] right-[5%] bottom-[4%] rounded-[36px] sm:rounded-[42px] overflow-hidden bg-black flex items-center justify-center box-border z-10">
          {cameraError ? (
            <div className="px-6 text-center text-sm font-sans font-medium text-slate-300 leading-relaxed select-none">
              {cameraError}
            </div>
          ) : (
            <div
              id="add-pet-qr-container"
              className="w-full h-full [&_video]:!w-full [&_video]:!h-full [&_video]:object-cover"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px] sm:max-w-[540px] [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[340px] px-4 flex flex-col items-center pointer-events-auto animate-fade-in shrink-0">
      <input
        ref={inputRef}
        type="text"
        maxLength={15}
        value={digitalCode}
        onChange={(e) => setDigitalCode(e.target.value.replace(/[^a-zA-Zа-яА-Я0-9]/g, "").toUpperCase())}
        onKeyDown={onKeyDown}
        placeholder="ВВЕДИТЕ КОД ИГРУШКИ"
        className="box-border h-[56px] sm:h-[64px] [@media(orientation:landscape)_and_(max-height:500px)]:h-[54px] w-full rounded-2xl sm:rounded-[32px] border-[4px] border-[rgb(129,199,20)] bg-white px-6 text-center text-[18px] sm:text-[24px] [@media(orientation:landscape)_and_(max-height:500px)]:text-[18px] font-black text-[#065f46] uppercase antialiased placeholder-slate-300 shadow-xl outline-none transition-colors focus:border-[#60aa05] tracking-wide"
      />
    </div>
  );
});
