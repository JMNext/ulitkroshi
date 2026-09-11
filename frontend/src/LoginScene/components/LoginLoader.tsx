import React, { useMemo } from "react";
import { useLoginStore } from "../store/useLoginStore";

const BEGEMOT_IMG_URL = new URL("@/assets/login_assets/begemot.png", import.meta.url).href;

export const LoginLoader = React.memo(() => {
  const progress = useLoginStore((state) => state.progress) ?? 0;

  const currentWidth = useMemo(() => (progress > 0 ? Math.max(36, 376 * progress) : 0), [progress]);

  return (
    <div className="animate-fade-in pointer-events-auto relative box-border flex h-[40px] w-[380px] shrink-0 origin-center -translate-y-[50px] scale-100 transform items-center justify-center rounded-[20px] border-2 border-white bg-[#ede9e6] p-0 select-none landscape:-translate-y-[30px]">
      <div
        className="absolute top-0 left-0 h-[36px] rounded-[18px] bg-[#f9b300] transition-all duration-75 ease-out"
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
