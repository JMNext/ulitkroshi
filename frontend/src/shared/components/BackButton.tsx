import { clsx } from "clsx";
import React from "react";

interface BackButtonProps extends React.ComponentProps<"button"> {
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  className,
  label = "Назад",
  onClick,
  ...props
}) => (
  <button
    type="button"
    onClick={onClick}
    className={clsx(
      "pointer-events-auto flex items-center justify-center gap-1.5",
      "h-[44px] px-4 sm:h-[48px] sm:px-5",
      "rounded-full border-2 border-white/90 bg-white/95 text-[#065f46]",
      "shadow-[0_4px_14px_rgba(0,0,0,0.15)] backdrop-blur-sm",
      "font-black text-[14px] sm:text-[15px] tracking-wide uppercase",
      "outline-none select-none transition-all duration-150 touch-manipulation",
      "active:scale-95 hover:bg-white hover:shadow-[0_6px_18px_rgba(0,0,0,0.2)]",
      className
    )}
    title={label}
    aria-label={label}
    {...props}
  >
    <svg
      className="h-5 w-5 sm:h-5 sm:w-5 stroke-[3] fill-none stroke-current shrink-0"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
    {label && <span className="leading-none pt-0.5">{label}</span>}
  </button>
);
