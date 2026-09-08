import React from 'react';

export const CloseButton = ({ className, ...props }: React.ComponentProps<'button'>) => (
  <button 
    type="button" 
    className={`w-10 h-10 sm:w-[46px] sm:h-[46px] border-none rounded-full bg-gradient-to-b from-[#ff5252] to-[#e63254] text-white flex items-center justify-center text-base sm:text-[20px] cursor-pointer shadow-md active:scale-95 transition-transform z-50 pointer-events-auto outline-none font-black select-none touch-manipulation ${className ?? ''}`}
    {...props}
  >
    ✕
  </button>
);
