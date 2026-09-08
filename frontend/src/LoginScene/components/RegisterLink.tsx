import React from 'react';

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
    <div className="scale-100 origin-center pointer-events-none z-10 flex items-center justify-center w-[300px] h-[44px] relative">
      <button 
        type="button"
        onClick={handleLinkClick}
        className="box-border border-0 m-0 p-0 bg-transparent cursor-pointer outline-none font-medium text-[20px] text-white text-center flex items-center justify-center transition-transform duration-75 hover:text-slate-200 active:scale-95 pointer-events-auto touch-manipulation select-none"
      >
        Зарегистрироваться
      </button>
    </div>
  );
});
