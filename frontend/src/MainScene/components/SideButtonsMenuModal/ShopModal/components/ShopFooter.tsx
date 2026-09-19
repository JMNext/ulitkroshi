import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { CURRENCY_IMG_URL } from "../constants/shop.constants";
import { useShopStore } from "../store/useShopStore";

interface ShopFooterProps {
  isCartView: boolean;
}

export const ShopFooter = ({ isCartView }: ShopFooterProps) => {
  const coins = useMainGameStore((s) => s.coins);
  const { purchaseStatus, getTotalPrice, checkout, cart } = useShopStore();

  const totalItemsInCart = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const showCartDetails = isCartView && (totalItemsInCart > 0 || purchaseStatus?.success);

  return (
    <div className="mt-2 box-border flex w-full shrink-0 flex-col gap-3 border-t-[3px] border-dashed border-[#e6e4d5] bg-transparent pt-3 select-none sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:pt-4">
      {showCartDetails && (
        <div className="animate-fade-in flex h-9 items-center gap-2 sm:h-12">
          <span className="flex h-full items-center text-[12px] leading-none font-black tracking-wide text-[#5c5b52] uppercase antialiased sm:text-[14px]">
            Итого к оплате:
          </span>
          <div className="box-border flex h-8 items-center justify-center gap-1 rounded-full border-[2.5px] border-[#e6e4d5] bg-white px-3 shadow-inner sm:h-9">
            <span className="mt-[1px] text-[18px] leading-none font-black text-[#1a3d1c] antialiased sm:text-[24px]">
              {getTotalPrice()}
            </span>
            <img src={CURRENCY_IMG_URL} className="block h-4 w-4 object-contain sm:h-5 sm:w-5" alt="" />
          </div>
        </div>
      )}

      <div className="flex h-10 w-full items-center justify-between gap-4 sm:ml-auto sm:h-12 sm:w-auto sm:justify-end">
        <div className="flex h-full items-center gap-2">
          <span className="flex h-full items-center text-[12px] leading-none font-black tracking-wide text-[#5c5b52] uppercase antialiased sm:text-[14px]">
            Ваш баланс:
          </span>
          <div className="box-border flex h-8 items-center gap-1.5 rounded-full border-[3px] border-[#ffb300] bg-[#fff4cc] px-3 shadow-[inset_0_-3px_0_rgba(255,179,0,0.4)] sm:h-11 sm:px-5">
            <span className="text-[13px] font-black tracking-wider whitespace-nowrap text-[#b76e00] uppercase antialiased sm:text-[16px]">
              {coins}
            </span>
            <img src={CURRENCY_IMG_URL} className="block h-4 w-4 animate-bounce object-contain sm:h-5 sm:w-5" alt="" />
          </div>
        </div>

        {showCartDetails && (
          <button
            type="button"
            onClick={() => checkout(false)}
            disabled={totalItemsInCart === 0}
            className="animate-fade-in flex h-9 cursor-pointer touch-manipulation items-center justify-center rounded-xl border-none bg-[#7cb342] px-5 text-[12px] font-black tracking-wider text-white uppercase shadow-[0_4px_0_#2e5c08] [text-shadow:0_2px_0_rgba(0,0,0,0.2)] active:translate-y-[4px] active:shadow-none disabled:pointer-events-none disabled:opacity-50 sm:h-12 sm:px-10 sm:text-[14px]"
          >
            Купить
          </button>
        )}
      </div>
    </div>
  );
};
