import React from 'react';

interface LoginButtonProps {
  onClick: () => void;
}

export const LoginButton = React.memo(({ onClick }: LoginButtonProps) => {
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onClick();
  };

  return (
    <div className="scale-100 origin-center pointer-events-none z-10 flex items-center justify-center w-[260px] h-[65px] relative">
      <button
        type="button"
        onClick={handleButtonClick}
        className="w-full h-full font-black text-white flex items-center justify-center border-none uppercase tracking-wide shadow-md active:scale-95 transition-transform duration-100 ease-out outline-none rounded-full text-[26px] px-6 box-border cursor-pointer bg-gradient-to-b from-[#81c714] to-[#60aa05] pointer-events-auto touch-manipulation select-none"
      >
        Войти
      </button>
    </div>
  );
});
