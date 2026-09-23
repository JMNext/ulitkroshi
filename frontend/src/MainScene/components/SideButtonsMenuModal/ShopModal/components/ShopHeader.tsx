interface ShopHeaderProps {
  isCartView: boolean;
  setIsCartView: (val: boolean) => void;
  setPurchaseStatus: (val: "SUCCESS" | "COINS_NOT_ENOUGH" | "ERROR" | null) => void;
}

export const ShopHeader = ({ isCartView, setIsCartView, setPurchaseStatus }: ShopHeaderProps) => {
  const toggle = (view: boolean) => { setPurchaseStatus(null); setIsCartView(view); };

  return (
    <div className="flex h-14 w-full shrink-0 items-center justify-between gap-2 border-b-[4px] border-dashed border-[#e6e4d5] pb-2 sm:h-16 sm:pb-3">
      <div className="flex h-10 min-w-0 flex-1 items-center gap-2 overflow-hidden select-none">
        {isCartView ? (
          <span onClick={() => toggle(false)} className="flex h-full shrink-0 cursor-pointer touch-manipulation items-center gap-1 text-[18px] font-black tracking-wide text-slate-400 uppercase antialiased sm:text-[22px]">
            <span className="relative -top-[1.5px] text-[22px] leading-none font-light sm:text-[26px]">‹</span> Назад
          </span>
        ) : (
          <h2 className="truncate text-[18px] leading-none font-black tracking-tight text-[#1a3d1c] uppercase antialiased [text-shadow:2px_2px_0_#fff] sm:text-[26px] sm:tracking-wide">
            Магазин бустов
          </h2>
        )}
      </div>
    </div>
  );
};
