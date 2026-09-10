import React, { useEffect, useContext } from "react";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";
import { ReactLayoutContext } from "../Step2UiManager";

interface PinPadProps {
  onSuccess: (sessionId: string) => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "0", "delete"];

export const PinPad = ({ onSuccess }: PinPadProps) => {
  const ctx = useContext(ReactLayoutContext);
  const { mode, handleKeyboardInput } = useRegistrationStep2Store();

  useEffect(() => {
    const handlePhysicalKeyDown = (e: KeyboardEvent) => {
      if (mode === "sent") return;
      if (/^\d$/.test(e.key) || e.key === "+") {
        handleKeyboardInput(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleKeyboardInput("delete");
      }
    };
    window.addEventListener("keydown", handlePhysicalKeyDown);
    return () => window.removeEventListener("keydown", handlePhysicalKeyDown);
  }, [mode, handleKeyboardInput]);

  const isDisabled = mode === "sent";

  return (
    <div className="relative flex h-[500px] w-[368px] shrink-0 items-center justify-center font-black pointer-events-none select-none transition-all duration-150 origin-center">
      <div className={`box-border grid h-full w-full grid-cols-3 gap-4 transition-all duration-150 ${isDisabled ? "opacity-40" : "pointer-events-auto"}`}>
        {KEYS.map((key) => {
          const isDelete = key === "delete";
          return (
            <button
              key={key}
              type="button"
              disabled={isDisabled}
              onPointerDown={(e) => {
                e.preventDefault();
                handleKeyboardInput(key);
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
              }}
              className={`box-border flex h-[113px] w-[112px] cursor-pointer touch-manipulation items-center justify-center rounded-2xl border-2 font-black shadow-md transition-all outline-none active:scale-95 text-[40px] ${
                isDelete
                  ? "border-red-500 bg-red-500 text-white hover:bg-red-600 text-[36px]"
                  : "border-slate-100 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isDelete ? "✕" : key}
            </button>
          );
        })}
      </div>
    </div>
  );
};
