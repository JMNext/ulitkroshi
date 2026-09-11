import { CURRENCY_IMG_URL, DYNAMIC_BOOSTS, getFruitUrlByStoreId } from "../constants/shop.constants";
import { useShopStore } from "../store/useShopStore";

const BOOSTS_MAP = Object.fromEntries(DYNAMIC_BOOSTS.map((b) => [b.id, b]));

export const ShopCartList = () => {
  const { cart, updateCartQuantity, removeFromCart } = useShopStore();

  return (
    <div className="animate-fade-in box-border flex h-full w-full flex-col items-center justify-start py-1 select-none">
      <div className="box-border flex w-full grow scrollbar-none flex-col gap-2 overflow-y-auto pr-1 pb-4 sm:gap-3">
        {Object.entries(cart).map(([idStr, qty]) => {
          const id = idStr.startsWith("fruit_") ? idStr : Number(idStr);
          const item = BOOSTS_MAP[id];

          if (!item || qty <= 0) return null;

          return (
            <div
              key={idStr}
              className="animate-fade-in box-border flex w-full items-center justify-between gap-2 rounded-2xl border-[3px] border-amber-100 bg-white p-2 shadow-[0_3px_0_rgba(0,0,0,0.02)] sm:p-3"
            >
              <div className="flex h-10 min-w-0 flex-1 items-center gap-2 sm:h-12 sm:gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-[2px] border-amber-200 bg-[#fffdf0] sm:h-12 sm:w-12">
                  <img src={getFruitUrlByStoreId(item.id) || CURRENCY_IMG_URL} className="block h-6 w-6 object-contain" alt="" />
                </div>
                <div className="flex h-full min-w-0 flex-1 flex-col justify-center text-left">
                  <span className="text-[12px] leading-none font-black tracking-tight break-words whitespace-normal text-[#1a3d1c] uppercase antialiased sm:text-[15px] sm:leading-tight sm:tracking-wide">
                    {item.name}
                  </span>
                  <div className="mt-0.5 flex items-center gap-0.5 text-[11px] leading-none font-black text-amber-600 antialiased sm:text-[12px]">
                    <span>{item.price}</span>
                    <img src={CURRENCY_IMG_URL} className="block h-2.5 w-2.5 object-contain opacity-85" alt="" />
                    <span className="text-[10px] opacity-75 sm:text-[11px]">/ шт.</span>
                  </div>
                </div>
              </div>

              <div className="flex h-7 shrink-0 items-center gap-2 sm:h-8 sm:gap-5">
                <div className="box-border flex h-7 min-w-[70px] items-center justify-between rounded-lg border-[2px] border-slate-200 bg-slate-50 px-1.5 shadow-inner sm:h-8 sm:min-w-[85px] sm:px-2">
                  <button
                    type="button"
                    onClick={() => (qty <= 1 ? removeFromCart(item.id) : updateCartQuantity(item.id, qty - 1))}
                    className="flex cursor-pointer items-center justify-center border-none bg-transparent pb-0.5 text-[14px] font-black text-slate-400 transition-transform outline-none hover:text-slate-600 active:scale-75 sm:text-[16px]"
                  >
                    -
                  </button>
                  <span className="flex h-full items-center justify-center text-[11px] font-black text-slate-700 antialiased sm:text-[13px]">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.id, qty + 1)}
                    className="flex cursor-pointer items-center justify-center border-none bg-transparent pb-0.5 text-[14px] font-black text-slate-400 transition-transform outline-none hover:text-slate-600 active:scale-75 sm:text-[16px]"
                  >
                    +
                  </button>
                </div>

                <div className="flex h-full min-w-[45px] items-center justify-end gap-0.5 text-[13px] font-black text-[#1a3d1c] sm:min-w-[60px] sm:text-[15px]">
                  <span className="mt-[1px] leading-none antialiased">{item.price * qty}</span>
                  <img src={CURRENCY_IMG_URL} className="block h-3 w-3 object-contain" alt="" />
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="flex cursor-pointer items-center justify-center border-none bg-transparent p-1 text-[16px] font-black text-rose-400 transition-colors transition-transform outline-none hover:text-rose-600 active:scale-75 sm:text-[18px]"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
