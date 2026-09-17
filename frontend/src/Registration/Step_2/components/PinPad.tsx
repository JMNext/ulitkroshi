import { clsx } from "clsx";
import { useEffect } from "react";
import { useRegistrationStep2Store } from "../store/useRegistrationStep2Store";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "0", "delete"] as const;

export const PinPad = () => {
  const { mode, handleKeyboardInput } = useRegistrationStep2Store();
  const isDisabled = mode === "sent";

  useEffect(() => {
    const handlePhysicalKeyDown = (e: KeyboardEvent) => {
      if (isDisabled) return;
      if (/^\d$/.test(e.key) || e.key === "+") {
        handleKeyboardInput(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleKeyboardInput("delete");
      }
    };
    window.addEventListener("keydown", handlePhysicalKeyDown);
    return () => window.removeEventListener("keydown", handlePhysicalKeyDown);
  }, [isDisabled, handleKeyboardInput]);

  return (
    <div className="pointer-events-none relative flex h-[500px] w-[368px] shrink-0 origin-center items-center justify-center font-black select-none">
      <div
        className={clsx(
          "box-border grid h-full w-full grid-cols-3 gap-4",
          isDisabled ? "opacity-40" : "pointer-events-auto"
        )}
      >
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
                (document.activeElement as HTMLElement)?.blur?.();
              }}
              className={clsx(
                "box-border flex h-[113px] w-[112px] cursor-pointer touch-manipulation items-center justify-center rounded-2xl border-2 text-[40px] font-black shadow-md outline-none active:scale-95",
                isDelete ? "border-red-500 bg-red-500 text-[36px] text-white" : "border-slate-100 bg-white text-slate-700"
              )}
            >
              {isDelete ? "✕" : key}
            </button>
          );
        })}
      </div>
    </div>
  );
};
