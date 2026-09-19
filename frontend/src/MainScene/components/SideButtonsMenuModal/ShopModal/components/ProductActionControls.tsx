import { CURRENCY_IMG_URL } from "../constants/shop.constants";

interface ProductActionControlsProps {
  countInCart: number;
  totalPrice: number;
  onInstantBuy: () => void;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
}

export const ProductActionControls = ({
  countInCart,
  totalPrice,
  onInstantBuy,
  onAddToCart,
  onRemoveFromCart
}: ProductActionControlsProps) => (
  <div className="mt-3.5 box-border flex w-full flex-col gap-2">
    <div className="box-border flex items-center justify-between px-0.5 text-[11px] font-black tracking-wide text-slate-400 uppercase select-none">
      <span>Сумма:</span>
      <div className="box-border flex h-6 items-center gap-1 rounded-full border border-solid border-emerald-100 bg-[#e8f5e9] px-2.5 text-[13px] font-black text-slate-800">
        <span className="leading-none antialiased">{totalPrice}</span>
        <img src={CURRENCY_IMG_URL} className="block h-3.5 w-3.5 object-contain" alt="" />
      </div>
    </div>

    {countInCart === 0 ? (
      <div className="mt-0.5 flex w-full flex-row gap-2">
        <button
          type="button"
          onClick={onInstantBuy}
          className="min-h-[38px] flex-1 cursor-pointer touch-manipulation items-center justify-center rounded-xl border-none bg-[#4caf50] px-2 py-2.5 text-[11px] font-black tracking-wider whitespace-nowrap text-white uppercase shadow-[0_3px_0_#2e7d32] active:translate-y-[3px] active:shadow-none"
        >
          Купить
        </button>
        <button
          type="button"
          onClick={onAddToCart}
          className="min-h-[38px] flex-1 cursor-pointer touch-manipulation items-center justify-center rounded-xl border-none bg-[#ff9800] px-2 py-2.5 text-[11px] font-black tracking-wider whitespace-nowrap text-white uppercase shadow-[0_3px_0_#f57c00] active:translate-y-[3px] active:shadow-none"
        >
          В <span className="max-sm:hidden">корзину</span><span className="sm:hidden">К.</span>
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={onRemoveFromCart}
        className="mt-0.5 flex min-h-[38px] w-full cursor-pointer items-center justify-center rounded-xl border-none bg-[#f44336] text-[12px] font-black text-white uppercase shadow-[0_3px_0_#d32f2f] active:translate-y-[3px] active:shadow-none"
      >
        Удалить из корзины
      </button>
    )}
  </div>
);
