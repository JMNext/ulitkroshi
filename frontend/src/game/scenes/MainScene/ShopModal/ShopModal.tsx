import { useEffect } from 'react';
import { Typography } from 'antd';
import { ProductCard } from '../ProductCard/ProductCard';
import { useMainGameStore } from '../useMainGameStore';
import eatIcon from '/src/assets/buttom_menu-icons/eat.svg';
import { BoostItem, useShopStore } from '../useShopStore';

const MOCK_BOOSTS: BoostItem[] = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  name: `Супер-Буст #${i + 1}`,
  price: 50 + i * 15,
  description: `Полезная еда для улитки. Мгновенно убирает чувство голода, восстанавливает силы и дает бонус к ростом на +${(i + 1) * 3}%.`,
}));

export const ShopModal = ({ onClose }: { onClose: () => void }) => {
  const coinsBalance = useMainGameStore((state) => state.coins);
  const setCoins = useMainGameStore((state) => state.setCoins);

  const selectedItem = useShopStore((state) => state.selectedItem);
  const setSelectedItem = useShopStore((state) => state.setSelectedItem);
  const cart = useShopStore((state) => state.cart);
  const purchaseStatus = useShopStore((state) => state.purchaseStatus);
  const setPurchaseStatus = useShopStore((state) => state.setPurchaseStatus);
  const clearCart = useShopStore((state) => state.clearCart);
  const resetStore = useShopStore((state) => state.resetStore);

  useEffect(() => {
    return () => resetStore();
  }, [resetStore]);

  const totalPrice = Object.entries(cart).reduce((total, [idStr, qty]) => {
    const item = MOCK_BOOSTS.find((b) => b.id === Number(idStr));
    return total + (item ? item.price * qty : 0);
  }, 0);

  const isCartEmpty = Object.keys(cart).length === 0;

  const handleCheckoutPurchase = () => {
    if (isCartEmpty || coinsBalance < totalPrice) {
      if (coinsBalance < totalPrice) {
        setPurchaseStatus({ success: false, text: 'Недостаточно монет для покупки!' });
      }
      return;
    }
    setCoins(coinsBalance - totalPrice);
    clearCart();
    setSelectedItem(null);
    setPurchaseStatus({ success: true, text: `Успешно куплено! Списано: ${totalPrice}` });
  };

  return (
    <section 
      className="flex w-screen max-w-[880px] portrait:max-w-[90vw] h-[85vh] portrait:h-[82vh] p-5 bg-white rounded-[36px] gap-5 portrait:gap-0 border-[5px] border-[#4caf50] box-border relative select-none shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-1 flex flex-col min-h-0 w-full">
        <header className="flex justify-between items-center mb-4 shrink-0">
          <div className="flex items-center gap-3 max-w-[80%]">
            <Typography.Title level={3} className="!text-[#1a3d1c] !font-black !text-2xl portrait:!text-xl !m-0 !p-0">
              Магазин бустов
            </Typography.Title>
            <div className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
              <Typography.Text className="!font-black !text-amber-700 !text-sm portrait:!text-xs !m-0 !p-0">
                Баланс: {coinsBalance}
              </Typography.Text>
              <img src={eatIcon} className="w-[14px] h-[14px]" alt="coin" />
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors text-2xl font-bold bg-transparent border-none cursor-pointer outline-none flex items-center justify-center"
          >
            ✕
          </button>
        </header>

        {purchaseStatus && (
          <div className={`mb-3 p-2 text-center text-xs font-black rounded-xl border flex items-center justify-center gap-1 shrink-0 ${purchaseStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            <Typography.Text className="!text-inherit !text-xs !font-black !m-0 !p-0">
              {purchaseStatus.text}
            </Typography.Text>
            {purchaseStatus.success && <img src={eatIcon} className="w-[12px] h-[12px]" alt="coin" />}
          </div>
        )}

        <div className="grid grid-cols-4 portrait:grid-cols-3 gap-3 overflow-y-auto pr-1 py-1.5 flex-1 content-start min-h-0">
          {MOCK_BOOSTS.map((item) => {
            const countInCart = cart[item.id] || 0;
            const isSelected = selectedItem?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`w-full aspect-square bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl flex flex-col items-center justify-between p-3 border-2 cursor-pointer relative transition-all outline-none ${isSelected ? 'border-4 border-[#4caf50] bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300'}`}
              >
                {countInCart > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#4caf50] text-white font-black text-xs px-1.5 py-0.5 rounded-full z-10 leading-none">
                    {countInCart}
                  </span>
                )}
                <img src={eatIcon} className="w-[52px] h-[48px] object-contain mt-0.5 pointer-events-none" alt="eat" />
                <span className="text-xs font-black text-slate-600 bg-white px-2 py-1 rounded-full border border-slate-200 leading-none mb-0.5 flex items-center gap-0.5 shrink-0 mt-2 pointer-events-none">
                  {item.price}
                  <img src={eatIcon} className="w-[11px] h-[11px]" alt="coin-icon" />
                </span>
              </button>
            );
          })}
        </div>

        {!isCartEmpty && (
          <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-solid border-slate-100 flex justify-between items-center shrink-0">
            <div className="flex flex-col">
              <Typography.Text className="!text-xs !text-slate-500 !font-bold !leading-none !mb-1 !m-0 !p-0">
                Итого к оплате:
              </Typography.Text>
              <Typography.Text className="!text-xl !font-black !text-emerald-600 flex items-center gap-1 !leading-none !m-0 !p-0">
                {totalPrice}
                <img src={eatIcon} className="w-[16px] h-[16px]" alt="coin" />
              </Typography.Text>
            </div>
            <button 
              onClick={handleCheckoutPurchase} 
              className="h-11 px-6 bg-amber-400 hover:bg-amber-500 transition-colors text-white font-black rounded-xl text-sm border-none uppercase tracking-wide flex items-center justify-center cursor-pointer outline-none"
            >
              Купить
            </button>
          </div>
        )}
      </div>

      {/* Оверлей карточки товара: на десктопе отображается справа, а на мобилках всплывает на весь экран поверх магазина, если выбран элемент */}
      <aside className={`w-[280px] border-solid border-slate-100 flex flex-col min-h-0 pl-5 portrait:pl-0 ${
        selectedItem 
          ? 'portrait:fixed portrait:inset-0 portrait:z-50 portrait:w-full portrait:h-full portrait:bg-white portrait:p-6 portrait:box-border' 
          : 'portrait:hidden border-l'
      }`}>
        <ProductCard onCloseCard={() => setSelectedItem(null)} />
      </aside>
    </section>
  );
};
