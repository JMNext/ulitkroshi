import { clsx } from "clsx";
import React from "react";

export const CloseButton = ({ className, ...props }: React.ComponentProps<"button">) => (
  <button
    type="button"
    className={clsx(
      "pointer-events-auto z-50 flex h-10 w-10 cursor-pointer touch-manipulation items-center justify-center rounded-full border-none bg-gradient-to-b from-[#ff5252] to-[#e63254] text-base font-black text-white shadow-md transition-transform outline-none select-none active:scale-95 sm:h-[46px] sm:w-[46px] sm:text-[20px]",
      className
    )}
    {...props}
  >
    ✕
  </button>
);
