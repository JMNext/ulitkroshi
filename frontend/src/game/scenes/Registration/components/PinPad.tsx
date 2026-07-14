import React from 'react';

interface PinPadProps {
  isDisabled?: boolean;
  onKeyClick: (key: string) => void;
}

export const PinPad = ({ isDisabled = false, onKeyClick }: PinPadProps) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '0', 'delete'];

  return (
    <div 
      className={`grid grid-cols-3 gap-x-6 gap-y-3.5 justify-center mx-auto select-none ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}
      style={{ width: '312px' }}
    >
      {keys.map((key) => {
        const isDelete = key === 'delete';
        const bgSrc = isDelete ? '/assets/board/red_button.svg' : '/assets/board/button.svg';

        return (
          <button
            key={key}
            disabled={isDisabled}
            onClick={() => onKeyClick(isDelete ? 'BACKSPACE' : key)}
            className="relative pointer-events-auto active:scale-95 transition-transform flex items-center justify-center cursor-pointer outline-none bg-transparent border-none p-0 w-[88px] h-[88px]"
          >
            <img src={bgSrc} className="w-full h-full object-contain pointer-events-none drop-shadow-md" alt="button-bg" />
            <div className="absolute inset-0 flex items-center justify-center font-sans font-black text-[34px] select-none">
              {isDelete ? (
                <span className="-mt-1 text-white text-[30px] font-extrabold">✕</span>
              ) : (
                <span className="-mt-0.5 text-slate-700">{key}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
