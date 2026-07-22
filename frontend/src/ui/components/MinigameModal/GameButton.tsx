import React from 'react';

interface GameButtonProps {
  text: string;
  onClick: () => void;
  gradientStyle?: React.CSSProperties; 
  buttonIcon?: string | React.ReactNode;
  height?: number; // Добавили динамическую высоту кнопок
}

export const GameButton = ({ text, onClick, gradientStyle, buttonIcon, height = 60 }: GameButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center w-full rounded-[16px] text-white \!font-black border-none uppercase tracking-wide transition-all duration-150 active:scale-95 text-[16px] cursor-pointer outline-none shadow-md hover:opacity-95 ${
        buttonIcon ? 'pl-14 pr-6' : 'px-6'
      }`}
      style={{ ...gradientStyle, height: `${height}px` }} // высота применяется динамически
    >
      {buttonIcon && (
        <div className="absolute left-5 w-7 h-7 flex items-center justify-center pointer-events-none">
          {typeof buttonIcon === 'string' ? (
            <img src={buttonIcon} className="w-full h-full object-contain" alt="" />
          ) : (
            buttonIcon
          )}
        </div>
      )}
      <span className="w-full text-center block tracking-wide pointer-events-none truncate">
        {text}
      </span>
    </button>
  );
};
