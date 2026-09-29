import { clsx } from "clsx";
import { CURRENCY_IMG_URL, DYNAMIC_BOOSTS, getFruitUrlByStoreId, getGroupStyles } from "../constants/shop.constants";
import { useShopStore } from "../store/useShopStore";

const ORDER = ["health_25", "health_50", "health_100", "exp_25", "exp_50"];
const SORTED = [...DYNAMIC_BOOSTS].sort((a, b) => (ORDER.indexOf(a.type) === -1 ? 999 : ORDER.indexOf(a.type)) - (ORDER.indexOf(b.type) === -1 ? 999 : ORDER.indexOf(b.type)));

const CartBadge = ({ count, onAdd, onMinus, onPlus }: { count: number; onAdd: () => void; onMinus: () => void; onPlus: () => void }) => {
  const has = count > 0;
  return (
    <div onClick={(e) => e.stopPropagation()} className={clsx("absolute -top-2 -right-2 z-20 box-border flex h-6 touch-manipulation items-center rounded-full border-[3px] border-white text-white shadow-md select-none", has ? "animate-fade-in min-w-[54px] justify-between bg-[#2e7d32] px-1" : "w-6 cursor-pointer justify-center bg-[#ff5722] p-0")}>
      {has ? (
        <>
          <button type="button" onClick={onMinus} className="flex cursor-pointer items-center justify-center border-none bg-transparent p-0 pb-0.5 text-[14px] font-black text-white transition-transform outline-none active:scale-77">-</button>
          <span className="mx-0.5 flex items-center justify-center text-[12px] font-black antialiased">{count}</span>
          <button type="button" onClick={onPlus} className="flex cursor-pointer items-center justify-center border-none bg-transparent p-0 pb-0.5 text-[14px] font-black text-white transition-transform outline-none active:scale-77">+</button>
        </>
      ) : (
        <button type="button" onClick={onAdd} className="flex h-full w-full cursor-pointer items-center justify-center border-none bg-transparent p-0 pb-0.5 text-[14px] font-black text-white transition-transform outline-none active:scale-77">+</button>
      )}
    </div>
  );
};

export const ShopCatalogView = ({ onSelected }: { onSelected: () => void }) => {
  const { selectedItem, setSelectedItem, cart, addToCart, updateCartQuantity, removeFromCart } = useShopStore();

  const handleSelect = (item: any, success: boolean) => {
    if (!success) { setSelectedItem(item); onSelected(); }
  };

  return (
    <div className="pointer-events-auto box-border flex h-full w-full [scrollbar-width:none] items-start justify-center overflow-y-auto px-1 py-2 select-none [&::-webkit-scrollbar]:hidden">
      <div className="box-border grid w-full max-w-full grid-cols-2 items-start justify-items-center gap-x-4 gap-y-4 pb-6 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-5 landscape:grid-cols-4">
        {SORTED.map((item) => {
          const count = cart[item.id] || 0;
          const styles = getGroupStyles(item.type);
          const isEpic = item.price >= 100;

          return (
            <div key={item.id} onClick={() => { setSelectedItem(item); onSelected(); }} className="relative flex w-full max-w-[135px] cursor-pointer touch-manipulation flex-col items-center justify-start transition-transform md:max-w-[155px] lg:max-w-[130px]">
              <div className={clsx("relative box-border flex aspect-square w-full items-center justify-center overflow-visible rounded-[24px] border-[4px] border-solid transition-all duration-150", styles.popup, styles.card, selectedItem?.id === item.id && "scale-[1.05]")}>
                {isEpic && (
                  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[20px]">
                    <div className="animate-shine absolute top-0 h-full w-1/2 -translate-x-[150%] -skew-x-[25deg] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  </div>
                )}
                <img src={getFruitUrlByStoreId(item.id) || CURRENCY_IMG_URL} className="pointer-events-none relative z-10 block h-14 w-14 object-contain" alt="" loading="lazy" />
                <CartBadge count={count} onAdd={() => handleSelect(item, addToCart(item.id, 1))} onMinus={() => count <= 1 ? removeFromCart(item.id) : updateCartQuantity(item.id, count - 1)} onPlus={() => handleSelect(item, updateCartQuantity(item.id, count + 1))} />
              </div>

              <div className="relative z-10 mt-1 flex min-h-[38px] w-full flex-col items-center justify-start px-0.5 text-center">
                <span className={clsx("mb-0.5 w-full text-[13px] leading-tight font-black tracking-wide uppercase antialiased sm:text-[14px]", isEpic ? "text-amber-800" : "text-[#1a3d1c]")}>{item.name}</span>
                <div className={clsx("mt-0.5 flex shrink-0 items-center justify-center gap-0.5 rounded-full border border-solid px-2 py-0.5 shadow-sm", isEpic ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-white/80")}>
                  <span className={clsx("text-[11px] leading-none font-black antialiased", isEpic ? "text-amber-700" : "text-slate-500")}>{item.price}</span>
                  <img src={CURRENCY_IMG_URL} className="pointer-events-none block h-2.5 w-2.5 object-contain" alt="" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
