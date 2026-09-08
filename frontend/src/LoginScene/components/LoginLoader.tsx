import React, { useMemo } from "react";
import { useLoginStore } from "../store/useLoginStore";

const BEGEMOT_IMG_URL = new URL("@/assets/login_assets/begemot.png", import.meta.url).href;

export const LoginLoader = React.memo(() => {
  const progress = useLoginStore((state) => state.progress) ?? 0;

  const currentWidth = useMemo(() => progress > 0 ? Math.max(36, 376 * progress) : 0, [progress]);

  return (
    <div className="scale-100 origin-center flex items-center justify-center w-[380px] h-[40px] animate-fade-in select-none relative bg-[#ede9e6] rounded-[20px] border-2 border-white box-border p-0 shrink-0 pointer-events-auto -translate-y-[50px] landscape:-translate-y-[30px] transform">
      <div 
        className="h-[36px] rounded-[18px] bg-[#f9b300] transition-all duration-75 ease-out absolute left-0 top-0" 
        style={{ width: `${currentWidth}px` }} 
      />
      <img
        src={BEGEMOT_IMG_URL}
        className="absolute bottom-[-2px] h-[64px] w-[64px] object-contain transition-all duration-75 ease-out"
        style={{ left: `${currentWidth - 14}px` }}
        alt=""
      />
    </div>
  );
});
