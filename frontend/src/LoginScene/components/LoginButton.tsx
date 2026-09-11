import React from "react";

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
    <div className="pointer-events-none relative z-10 flex h-[65px] w-[260px] origin-center scale-100 items-center justify-center">
      <button
        type="button"
        onClick={handleButtonClick}
        className="pointer-events-auto box-border flex h-full w-full cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#81c714] to-[#60aa05] px-6 text-[26px] font-black tracking-wide text-white uppercase shadow-md transition-transform duration-100 ease-out outline-none select-none active:scale-95"
      >
        Войти
      </button>
    </div>
  );
});
