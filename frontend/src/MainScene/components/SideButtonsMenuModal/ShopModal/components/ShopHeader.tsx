import { useShopStore } from "../store/useShopStore";

interface ShopHeaderProps {
  isCartView: boolean;
  setIsCartView: (val: boolean) => void;
  setPurchaseStatus: (val: any) => void;
}

export const ShopHeader = ({ isCartView, setIsCartView, setPurchaseStatus }: ShopHeaderProps) => {
  const cart = useShopStore((s) => s.cart);
  const totalItemsInCart = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const toggleCartView = (view: boolean) => {
    setPurchaseStatus(null);
    setIsCartView(view);
  };

  return (
    <div className="flex h-14 w-full shrink-0 items-center justify-between gap-2 border-b-[4px] border-dashed border-[#e6e4d5] pr-12 pb-2 sm:h-16 sm:pr-0 sm:pb-3">
      <div className="flex h-10 min-w-0 flex-1 items-center gap-2 overflow-hidden">
        {isCartView ? (
          <span
            onClick={() => toggleCartView(false)}
            className="m-0 flex h-full shrink-0 cursor-pointer touch-manipulation items-center gap-1 text-[18px] font-black tracking-wide text-slate-400 uppercase antialiased transition-colors select-none hover:text-slate-600 sm:text-[22px]"
          >
            <span className="relative -top-[1.5px] text-[22px] leading-none font-light sm:text-[26px]">‹</span> Назад
          </span>
        ) : (
          <h2 className="m-0 flex h-full items-center truncate text-[18px] leading-none font-black tracking-tight text-[#1a3d1c] uppercase antialiased select-none [text-shadow:2px_2px_0_#fff] sm:text-[26px] sm:tracking-wide">
            Магазин бустов
          </h2>
        )}
      </div>

      {/* Убрали лишний вложенный div-контейнер, так как кнопка позиционируется флексами родителя */}
      {totalItemsInCart > 0 && !isCartView && (
        <button
          type="button"
          onClick={() => toggleCartView(true)}
          className="relative mr-2 ml-auto box-border flex h-9 w-10 shrink-0 cursor-pointer touch-manipulation items-center justify-center rounded-full border-[3px] border-[#ffb300] bg-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.03)] transition-transform select-none active:scale-95 sm:mr-14 sm:h-10 sm:w-11"
        >
          <span className="mt-[-2px] block text-[16px] leading-none opacity-75 grayscale sm:text-[18px]">🛒</span>
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[#ff5722] text-[10px] leading-none font-black text-white antialiased shadow-sm sm:h-5 sm:w-5">
            {totalItemsInCart}
          </span>
        </button>
      )}
    </div>
  );
};
