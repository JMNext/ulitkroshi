import React from "react";
import { useShopStore } from "./store/useShopStore";
import { DYNAMIC_BOOSTS, getFruitUrlByStoreId, CURRENCY_IMG_URL, getGroupStyles } from "./shop.constants";

interface ShopCatalogViewProps {
  onSelected: () => void;
}

const CATEGORY_ORDER = ["health_25", "health_50", "health_100", "exp_25", "exp_50"];

const SORTED_BOOSTS = [...DYNAMIC_BOOSTS].sort((a, b) => {
  const indexA = CATEGORY_ORDER.indexOf(a.type);
  const indexB = CATEGORY_ORDER.indexOf(b.type);
  return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
});

export const ShopCatalogView = ({ onSelected }: ShopCatalogViewProps) => {
  const {
    selectedItem,
    setSelectedItem,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart
  } = useShopStore();

  return (
    <div className="pointer-events-auto box-border flex h-full w-full items-start justify-center overflow-y-auto px-1 py-2 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="box-border grid w-full max-w-full grid-cols-2 items-start justify-items-center gap-x-4 gap-y-4 pb-6 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-5 lg:gap-y-4 landscape:grid-cols-4 sm:landscape:grid-cols-4">
        {SORTED_BOOSTS.map((item) => {
          const countInCart = cart[item.id] || 0;
          const styles = getGroupStyles(item.type);
          const isEpic = item.price >= 100;
          const isSelected = selectedItem?.id === item.id;
          const hasItems = countInCart > 0;

          return (
            <div
              key={item.id}
              onClick={() => {
                setSelectedItem(item);
                onSelected();
              }}
              className="relative flex w-full max-w-[135px] cursor-pointer flex-col items-center justify-start md:max-w-[155px] lg:max-w-[130px] touch-manipulation transition-transform"
            >
              <div className={`relative box-border flex aspect-square w-full items-center justify-center overflow-visible rounded-[24px] border-[4px] border-solid transition-all duration-150 ${styles.popup} ${styles.card} ${isSelected ? "scale-[1.05]" : ""}`}>
                {isEpic && (
                  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[20px]">
                    <div className="absolute top-0 h-full w-1/2 -translate-x-[150%] -skew-x-[25deg] animate-shine bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  </div>
                )}

                <img
                  src={getFruitUrlByStoreId(item.id) || CURRENCY_IMG_URL}
                  className="pointer-events-none relative z-10 block h-14 w-14 object-contain"
                  alt=""
                  loading="lazy"
                />

                <div 
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute -top-2 -right-2 z-20 box-border flex h-6 items-center rounded-full border-[3px] border-white text-white shadow-md select-none touch-manipulation ${
                    hasItems ? "animate-fade-in min-w-[54px] justify-between bg-[#2e7d32] px-1" : "w-6 justify-center bg-[#ff5722] p-0 cursor-pointer"
                  }`}
                >
                  {hasItems ? (
                    <>
                      <button
                        type="button"
                        onClick={() => countInCart <= 1 ? removeFromCart(item.id) : updateCartQuantity(item.id, countInCart - 1)}
                        className="flex cursor-pointer items-center justify-center border-none bg-transparent p-0 pb-0.5 text-[14px] font-black text-white outline-none transition-transform active:scale-75"
                      >
                        -
                      </button>
                      <span className="mx-0.5 flex items-center justify-center text-[12px] font-black antialiased">
                        {countInCart}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, countInCart + 1)}
                        className="flex cursor-pointer items-center justify-center border-none bg-transparent p-0 pb-0.5 text-[14px] font-black text-white outline-none transition-transform active:scale-75"
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(item.id, 1)}
                      className="flex w-full h-full cursor-pointer items-center justify-center border-none bg-transparent p-0 pb-0.5 text-[14px] font-black text-white outline-none transition-transform active:scale-75"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>

              <div className="relative z-10 mt-1 flex min-h-[38px] w-full flex-col items-center justify-start px-0.5 select-none text-center">
                <span className={`mb-0.5 w-full text-center text-[13px] leading-tight font-black tracking-wide break-words whitespace-normal uppercase sm:text-[14px] antialiased ${isEpic ? "text-amber-800" : "text-[#1a3d1c]"}`}>
                  {item.name}
                </span>
                <div className={`mt-0.5 flex shrink-0 items-center justify-center gap-0.5 rounded-full border border-solid px-2 py-0.5 shadow-sm ${isEpic ? "border-amber-200 bg-amber-50" : "border-slate-100 bg-white/80"}`}>
                  <span className={`text-[11px] leading-none font-black antialiased ${isEpic ? "text-amber-700" : "text-slate-500"}`}>
                    {item.price}
                  </span>
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
