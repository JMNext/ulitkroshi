import { useRegistrationStep3Store } from "../store/useRegistrationStep3Store";
import { FRUIT_URLS } from "./fruitAssets";

interface CaptchaFruitGridProps {
  sessionId: string;
  onSuccess: () => void;
}

export const CaptchaFruitGrid = ({ sessionId, onSuccess }: CaptchaFruitGridProps) => {
  const { mode, shake, attempts, isSubmitting, toggleSelect, sel: selected = [], fruitOrder = [] } = useRegistrationStep3Store();

  const isGridDisabled = mode === "error" || isSubmitting || attempts >= 3;

  return (
    <div className="pointer-events-none relative flex h-[424px] w-[424px] max-w-full shrink-0 origin-center items-center justify-center transition-all duration-150">
      <div
        className={`box-border flex h-full w-full items-center justify-center transition-all duration-150 ${isSubmitting ? "opacity-40" : "opacity-100"} ${shake ? "animate-shake" : ""}`}
      >
        <div className="box-border grid grid-cols-4 gap-4">
          {fruitOrder.map((fruitId) => {
            const isSelected = selected.includes(fruitId);
            const resolvedUrl = FRUIT_URLS[fruitId];

            let borderClass = "border-slate-100 shadow-sm hover:border-sky-400 focus:border-sky-500 active:border-sky-600";
            if (isSelected) {
              borderClass = shake ? "border-red-500 bg-red-50 animate-shake shadow-md" : "border-[#a6f034] shadow-md";
            }

            return (
              <button
                key={`grid-fruit-${fruitId}`}
                type="button"
                disabled={isGridDisabled}
                onClick={() => !isGridDisabled && toggleSelect(fruitId, sessionId, onSuccess)}
                className={`pointer-events-auto box-border flex h-[94px] w-[94px] shrink-0 cursor-pointer touch-manipulation items-center justify-center overflow-hidden rounded-full border-4 bg-white p-0 transition-all outline-none active:scale-95 ${borderClass}`}
              >
                {resolvedUrl && (
                  <img
                    src={resolvedUrl}
                    width="56"
                    height="56"
                    className="pointer-events-none block h-14 w-14 object-contain"
                    alt=""
                    loading="lazy"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
