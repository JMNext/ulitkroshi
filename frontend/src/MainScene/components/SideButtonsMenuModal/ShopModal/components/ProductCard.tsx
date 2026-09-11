import { CloseButton } from "@/ModalWrapper/CloseButton";
import * as Dialog from "@radix-ui/react-dialog";
import { BADGES_CONFIG, CURRENCY_IMG_URL, DYNAMIC_BOOSTS, getFruitUrlByStoreId, getGroupStyles } from "../constants/shop.constants";
import { useShopStore } from "../store/useShopStore";

interface ProductCardProps {
  onClose: () => void;
}

interface ShopItem {
  id: string | number;
  name: string;
  type: string;
  price: number;
  description: string;
}

interface ShopStoreState {
  selectedItem: ShopItem | null;
  cart: Record<string | number, number>;
  removeFromCart: (id: string | number) => void;
  addToCart: (id: string | number, qty: number) => boolean;
  updateCartQuantity: (id: string | number, qty: number) => boolean;
  checkout: () => void;
}

export const ProductCard = ({ onClose }: ProductCardProps) => {
  const { selectedItem, cart, removeFromCart, addToCart, updateCartQuantity, checkout } = useShopStore() as unknown as ShopStoreState;

  if (!selectedItem) return null;

  const fullItem = DYNAMIC_BOOSTS.find((b) => b.id === selectedItem.id) || selectedItem;
  const countInCart = cart[fullItem.id] || 0;
  const groupStyles = getGroupStyles(fullItem.type);

  const handleInstantBuy = () => {
    if (!addToCart(fullItem.id, 1)) return onClose();
    setTimeout(() => {
      checkout();
      onClose();
    }, 0);
  };

  const handleAddToCartClick = () => {
    if (!addToCart(fullItem.id, 1)) onClose();
  };

  const handleIncreaseQuantity = () => {
    if (!updateCartQuantity(fullItem.id, countInCart + 1)) onClose();
  };

  const handleDecreaseQuantity = () => {
    if (countInCart <= 1) removeFromCart(fullItem.id);
    else updateCartQuantity(fullItem.id, countInCart - 1);
  };

  const renderEffectBadge = (type: string) => {
    const b = BADGES_CONFIG[type];
    if (!b) return null;
    return (
      <div
        className={`rounded-full border-[2px] ${b.border} ${b.bg} px-4 py-0.5 text-[11px] font-black tracking-wider ${b.text} uppercase ${b.shadow} antialiased`}
      >
        {b.t}
      </div>
    );
  };

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Оверлей поверх магазина */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/20" />

        <Dialog.Content className="fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] outline-none">
          {/* Твоя оригинальная карточка товара с bounce-анимацией и стилями группы */}
          <div
            className={`animate-bounce-in flex h-auto w-[320px] origin-center flex-col items-center overflow-visible rounded-[32px] border-[5px] border-solid bg-[#fffef5] p-5 shadow-[0_14px_0_rgba(0,0,0,0.15)] max-sm:w-[330px] max-sm:scale-95 max-sm:rounded-[24px] max-sm:p-4 max-md:landscape:w-[480px] max-md:landscape:scale-100 max-md:landscape:p-3.5 ${groupStyles.popup}`}
          >
            <Dialog.Close asChild>
              <CloseButton onClick={onClose} className="absolute top-3 right-3 z-30" />
            </Dialog.Close>

            <Dialog.Title className="sr-only">Карточка товара {fullItem.name}</Dialog.Title>

            <div
              className="box-border flex w-full flex-col items-center justify-start gap-4 bg-transparent p-0 select-none max-md:landscape:max-h-[76vh] max-md:landscape:flex-row max-md:landscape:items-start max-md:landscape:gap-5 max-md:landscape:overflow-y-auto max-md:landscape:pr-1 [&::-webkit-scrollbar]:hidden"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}
            >
              <div className="flex shrink-0 flex-col items-center justify-center max-md:landscape:mt-1">
                <div
                  className={`flex h-[92px] w-[92px] items-center justify-center rounded-[22px] border-[4px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] max-md:landscape:h-[80px] max-md:landscape:w-[80px] ${groupStyles.card}`}
                >
                  <img
                    src={getFruitUrlByStoreId(fullItem.id) || CURRENCY_IMG_URL}
                    className="pointer-events-none block h-14 w-14 object-contain max-md:landscape:h-12 max-md:landscape:w-12"
                    alt=""
                  />
                </div>
              </div>

              <div className="flex w-full flex-1 flex-col items-center justify-start max-md:landscape:items-start">
                <div className="mx-auto flex w-full flex-col items-center justify-center gap-1.5 text-center max-md:landscape:mx-0 max-md:landscape:items-start max-md:landscape:text-left">
                  <h3 className="m-0 w-full truncate text-[21px] font-black tracking-wide text-[#1a3d1c] uppercase antialiased max-sm:text-[19px]">
                    {fullItem.name}
                  </h3>
                  {renderEffectBadge(fullItem.type)}

                  <div className="box-border flex h-[22px] items-center justify-center gap-1 rounded-full border border-solid border-amber-100 bg-amber-50 px-3 text-[11px] font-black tracking-wide text-amber-600 uppercase antialiased">
                    <span>Цена: {fullItem.price}</span>
                    <img src={CURRENCY_IMG_URL} className="block h-3.5 w-3.5 object-contain" alt="" />
                  </div>

                  <p className="m-0 mt-1 w-full text-center text-[12.5px] leading-normal font-bold text-slate-500 antialiased max-sm:text-[12px] max-md:landscape:text-left">
                    {fullItem.description}
                  </p>
                </div>

                {/* Блок изменения количества товара и кнопок покупки */}
                <div className="mt-3.5 box-border flex w-full flex-col gap-2">
                  <div className="box-border flex h-[34px] items-center justify-between rounded-xl border-[3px] border-slate-200 bg-white px-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
                    <button
                      type="button"
                      onClick={handleDecreaseQuantity}
                      disabled={countInCart === 0}
                      className="flex cursor-pointer items-center justify-center border-none bg-transparent pb-1 text-[22px] font-black text-slate-400 transition-transform outline-none active:scale-77 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="text-[15px] font-black text-slate-700 antialiased">{countInCart}</span>
                    <button
                      type="button"
                      onClick={() => (countInCart === 0 ? handleAddToCartClick() : handleIncreaseQuantity())}
                      className="flex cursor-pointer items-center justify-center border-none bg-transparent p-0 pb-1 text-[22px] font-black text-slate-400 transition-transform active:scale-77"
                    >
                      +
                    </button>
                  </div>

                  <div className="box-border flex items-center justify-between px-0.5 text-[11px] font-black tracking-wide text-slate-400 uppercase select-none">
                    <span>Сумма:</span>
                    <div className="box-border flex h-6 items-center gap-1 rounded-full border border-solid border-emerald-100 bg-[#e8f5e9] px-2.5 text-[13px] font-black text-slate-800">
                      <span className="leading-none antialiased">{Number(fullItem.price) * countInCart}</span>
                      <img src={CURRENCY_IMG_URL} className="block h-3.5 w-3.5 object-contain" alt="" />
                    </div>
                  </div>

                  {countInCart === 0 ? (
                    <div className="mt-0.5 flex w-full flex-row gap-2">
                      <button
                        type="button"
                        onClick={handleInstantBuy}
                        className="min-h-[38px] flex-1 cursor-pointer touch-manipulation items-center justify-center rounded-xl border-none bg-[#4caf50] px-2 py-2.5 text-[11px] font-black tracking-wider whitespace-nowrap text-white uppercase shadow-[0_3px_0_#2e7d32] active:translate-y-[3px] active:shadow-none"
                      >
                        Купить
                      </button>
                      <button
                        type="button"
                        onClick={handleAddToCartClick}
                        className="min-h-[38px] flex-1 cursor-pointer touch-manipulation items-center justify-center rounded-xl border-none bg-[#ff9800] px-2 py-2.5 text-[11px] font-black tracking-wider whitespace-nowrap text-white uppercase shadow-[0_3px_0_#f57c00] active:translate-y-[3px] active:shadow-none"
                      >
                        В <span className="max-sm:hidden">корзину</span>
                        <span className="sm:hidden">К.</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeFromCart(fullItem.id)}
                      className="mt-0.5 flex min-h-[38px] w-full cursor-pointer items-center justify-center rounded-xl border-none bg-[#f44336] text-[12px] font-black text-white uppercase shadow-[0_3px_0_#d32f2f] active:translate-y-[3px] active:shadow-none"
                    >
                      Удалить из корзины
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
