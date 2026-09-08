import React, { useContext } from "react";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";
import { ReactLayoutContext } from "../Step2UiManager";

export const DisplayFields = () => {
  const ctx = useContext(ReactLayoutContext);
  const { mode, phone, code } = useRegistrationStep2Store();

  const displayText = mode === "code" 
    ? code.padEnd(4, "_").split("").join(" ") 
    : phone;

  return (
    <div className="relative flex h-[76px] w-[460px] shrink-0 items-center justify-center font-black pointer-events-none select-none text-slate-700 transition-all duration-150 origin-center">
      <div className="box-border flex h-full w-full items-center justify-center rounded-[38px] border border-slate-100 bg-white px-6 text-center shadow-md">
        <span className="block w-full truncate text-[22px] tracking-wider font-black">
          {displayText}
        </span>
      </div>
    </div>
  );
};
