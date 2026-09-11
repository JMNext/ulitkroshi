import React from "react";

interface RegisterLinkProps {
  onClick: () => void;
}

export const RegisterLink = React.memo(({ onClick }: RegisterLinkProps) => {
  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onClick();
  };

  return (
    <div className="pointer-events-none relative z-10 flex h-[44px] w-[300px] origin-center scale-100 items-center justify-center">
      <button
        type="button"
        onClick={handleLinkClick}
        className="pointer-events-auto m-0 box-border flex cursor-pointer touch-manipulation items-center justify-center border-0 bg-transparent p-0 text-center text-[20px] font-medium text-white transition-transform duration-75 outline-none select-none hover:text-slate-200 active:scale-95"
      >
        Зарегистрироваться
      </button>
    </div>
  );
});
