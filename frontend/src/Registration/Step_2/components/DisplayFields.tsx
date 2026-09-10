import React from "react";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";

export const DisplayFields = () => {
  const { mode, code, rawPhone, errorMessage } = useRegistrationStep2Store();

  let displayText = "";

  if (mode === "code" && errorMessage !== "user_not_found") {
    displayText = code.padEnd(4, "_").split("").join(" ");
  } else {
    let f = "+7 ( ";
    for (let i = 0; i < 10; i++) {
      f += rawPhone[i] || "_";
      if (i === 2) f += " ) ";
      if (i === 5 || i === 7) f += " - ";
    }
    displayText = f;
  }

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
