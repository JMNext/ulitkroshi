import { memo } from 'react';

interface ScannerBottomControlsProps {
  mode: 'qr' | 'code';
  digitalCode: string;
  setMode: (mode: 'qr' | 'code') => void;
  onSubmit: () => void;
}

const BTN_BASE = "w-full text-white flex items-center justify-center border-none uppercase tracking-wide active:scale-95 transition-transform duration-100 ease-out outline-none rounded-full cursor-pointer shadow-md font-black touch-manipulation whitespace-nowrap px-4";
const BTN_ORANGE = `${BTN_BASE} bg-gradient-to-b from-[#ff9800] to-[#f57c00]`;
const RESP_H_T = "[@media(orientation:landscape)_and_(max-height:500px)]:h-[46px] [@media(orientation:landscape)_and_(max-height:500px)]:text-[13px]";

export const ScannerBottomControls = memo(({ mode, digitalCode, setMode, onSubmit }: ScannerBottomControlsProps) => {
  if (mode === 'qr') {
    return (
      <div className="w-full max-w-[280px] [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[200px] mx-auto flex flex-col pointer-events-auto z-50 font-black select-none mt-auto pt-2 pb-6 sm:pb-2 mb-[74px] [@media(orientation:landscape)_and_(max-height:500px)]:mb-0 shrink-0">
        <button
          type="button"
          onClick={() => setMode('code')}
          className={`${BTN_ORANGE} h-[50px] text-[15px] ${RESP_H_T}`}
        >
          Ввести код вручную
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[340px] sm:max-w-[540px] [@media(orientation:landscape)_and_(max-height:500px)]:max-w-[200px] mx-auto flex flex-row [@media(orientation:landscape)_and_(max-height:500px)]:flex-col gap-4 [@media(orientation:landscape)_and_(max-height:500px)]:gap-2.5 pointer-events-auto z-50 font-black select-none mt-5 px-4 sm:px-0 [@media(orientation:landscape)_and_(max-height:500px)]:px-0 shrink-0">
      <button
        type="button"
        onClick={() => setMode('qr')}
        className={`${BTN_ORANGE} flex-1 [@media(orientation:landscape)_and_(max-height:500px)]:w-full h-[52px] sm:h-[64px] text-[14px] sm:text-[16px] ${RESP_H_T}`}
      >
        Включить камеру
      </button>
      
      <button
        type="button"
        disabled={!digitalCode.trim()}
        onClick={onSubmit}
        className={`${BTN_BASE} bg-gradient-to-b from-[#81c714] to-[#60aa05] flex-1 [@media(orientation:landscape)_and_(max-height:500px)]:w-full h-[52px] sm:h-[64px] text-[14px] sm:text-[16px] ${RESP_H_T} disabled:scale-100 disabled:opacity-40`}
      >
        Подтвердить
      </button>
    </div>
  );
});
