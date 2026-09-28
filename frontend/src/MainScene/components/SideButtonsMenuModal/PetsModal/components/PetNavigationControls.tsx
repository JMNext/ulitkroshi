import { clsx } from "clsx";

interface PetNavigationControlsProps {
  currentIndex: number; isUnlocked: boolean; isSelected: boolean;
  handlePrev: () => void; handleNext: () => void; onSelect: () => void;
}

export const PetNavigationControls = ({ currentIndex, isUnlocked, isSelected, handlePrev, handleNext, onSelect }: PetNavigationControlsProps) => (
  <div className="pointer-events-auto absolute right-0 bottom-6 left-0 z-10 flex shrink-0 flex-col items-center gap-3">
    <div className="flex items-center justify-center gap-10">
      <button type="button" onClick={handlePrev} className="flex h-12 w-12 cursor-pointer touch-manipulation items-center justify-center border-none bg-transparent p-0 font-sans text-[48px] leading-none font-black text-slate-500 transition-transform outline-none hover:text-slate-800 active:scale-75">‹</button>

      <button
        type="button"
        disabled={!isUnlocked || isSelected}
        onClick={onSelect}
        className={clsx(
          "min-w-[140px] rounded-full border-[3px] border-solid px-6 py-2.5 text-center text-[14px] font-black tracking-wider uppercase shadow-lg transition-all outline-none",
          isUnlocked
            ? isSelected ? "cursor-default border-[#ffca28] bg-[#81c714] text-white" : "cursor-pointer touch-manipulation border-white bg-[#ff9800] text-white active:scale-[0.98]"
            : "cursor-default border-transparent bg-slate-400/40 text-slate-500"
        )}
      >
        {isUnlocked ? (isSelected ? "Выбран" : "Выбрать") : "Закрыто"}
      </button>

      <button type="button" onClick={handleNext} className="flex h-12 w-12 cursor-pointer touch-manipulation items-center justify-center border-none bg-transparent p-0 font-sans text-[48px] leading-none font-black text-slate-500 transition-transform outline-none hover:text-slate-800 active:scale-75">›</button>
    </div>
    <div className="mt-1 text-[15px] font-black tracking-widest text-slate-500/80 uppercase select-none">{currentIndex + 1} из 20</div>
  </div>
);
