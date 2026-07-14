import React, { useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ProductCard, BoostItem } from './ProductCard';

let shopRoot: Root | null = null;
const CONTAINER_ID = 'shop-modal-overlay';

const MOCK_BOOSTS: BoostItem[] = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  name: `Супер-Буст #${i + 1}`,
  price: 50 + (i * 15),
  description: `Полезная еда для улитки. Мгновенно убирает чувство голода, восстанавливает силы и дает бонус к росту на +${(i + 1) * 3}%.`,
}));

export function showShopModal(): void {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.getElementById('game-container')?.appendChild(container);
  }
  if (!shopRoot) shopRoot = createRoot(container);
  shopRoot.render(<ShopModalComponent />);
}

export function hideShopModal(): void {
  if (shopRoot) { shopRoot.unmount(); shopRoot = null; }
  document.getElementById(CONTAINER_ID)?.remove();
}

function ShopModalComponent() {
  const [selectedItem, setSelectedItem] = useState<BoostItem | null>(null);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [coinsBalance, setCoinsBalance] = useState<number>(1500);
  const [purchaseStatus, setPurchaseStatus] = useState<{ success: boolean; text: string } | null>(null);

  const handleAddToCart = (id: number, qty: number) => {
    setPurchaseStatus(null);
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + qty }));
  };

  const handleRemoveFromCart = (id: number) => {
    setCart(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const calculateTotalPrice = () => {
    return Object.entries(cart).reduce((total, [idStr, qty]) => {
      const item = MOCK_BOOSTS.find(b => b.id === Number(idStr));
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const totalPrice = calculateTotalPrice();
  const isCartEmpty = Object.keys(cart).length === 0;

  const handleCheckoutPurchase = () => {
    if (isCartEmpty) return;

    if (coinsBalance < totalPrice) {
      setPurchaseStatus({ success: false, text: 'Недостаточно монет для покупки!' });
      return;
    }

    setCoinsBalance(prev => prev - totalPrice);
    setCart({});
    setSelectedItem(null);
    setPurchaseStatus({ success: true, text: `Успешно куплено! Списано: ${totalPrice}` });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] p-6 w-full max-w-[880px] h-[85vh] flex flex-col md:flex-row gap-6 shadow-2xl border-4 border-[#4caf50] relative">
        
        {/* СЕТКА ТОВАРОВ */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <h3 className="text-[#1a3d1c] font-bold text-2xl">Магазин бустов</h3>
              <div className="bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-sm font-bold text-amber-700 flex items-center gap-1 shadow-sm">
                Баланс: {coinsBalance}
                <img src="/assets/buttom_menu-icons/eat.svg" className="w-[14px] h-[14px] shrink-0" alt="coin" />
              </div>
            </div>
            {/* НЕЗАВИСИМАЯ КНОПКА ЗАКРЫТИЯ МАГАЗИНА */}
            <button 
              onClick={hideShopModal} 
              className="text-slate-400 hover:text-slate-600 text-2xl font-bold p-1 cursor-pointer transition-colors active:scale-95"
            >
              ✕
            </button>
          </div>

          {purchaseStatus && (
            <div className={`mb-3 p-2.5 text-center text-xs font-bold rounded-xl border flex items-center justify-center gap-1 ${
              purchaseStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {purchaseStatus.text}
              {purchaseStatus.success && <img src="/assets/buttom_menu-icons/eat.svg" className="w-[12px] h-[12px] shrink-0" alt="coin" />}
            </div>
          )}
          
          <div className="grid grid-cols-4 gap-3 overflow-y-auto pr-1 py-2 flex-1">
            {MOCK_BOOSTS.map((item) => {
              const countInCart = cart[item.id] || 0;
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className={`aspect-square bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl flex flex-col items-center justify-between p-2 border-2 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all relative ${
                    selectedItem?.id === item.id ? 'border-[#4caf50] bg-emerald-50/30' : 'border-slate-200'
                  }`}
                >
                  {countInCart > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#4caf50] text-white font-bold text-xs px-2 py-0.5 rounded-full shadow-sm">
                      {countInCart}
                    </span>
                  )}
                  <img src="/assets/buttom_menu-icons/eat.svg" className="w-[55px] h-[55px] object-contain mt-1" alt="eat" />
                  <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm leading-none mb-0.5 flex items-center gap-0.5">
                    {item.price}
                    <img src="/assets/buttom_menu-icons/eat.svg" className="w-[12px] h-[12px] shrink-0" alt="coin-icon" />
                  </span>
                </div>
              );
            })}
          </div>

          {!isCartEmpty && (
            <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center animate-slide-down">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium">Итого к оплате:</span>
                <span className="text-xl font-black text-emerald-600 flex items-center gap-1">
                  {totalPrice}
                  <img src="/assets/buttom_menu-icons/eat.svg" className="w-[18px] h-[18px] shrink-0" alt="coin" />
                </span>
              </div>
              <button 
                onClick={handleCheckoutPurchase}
                className="h-11 px-6 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-black rounded-xl shadow-[0_3px_0_#c78200] active:translate-y-[2px] active:shadow-none transition-all text-sm cursor-pointer"
              >
                Купить  
              </button>
            </div>
          )}
        </div>

        {/* КАРТОЧКА ТОВАРА */}
        <div className="w-full md:w-[320px] bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col relative">
          <ProductCard 
            selectedItem={selectedItem}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onCloseCard={() => setSelectedItem(null)} // Закрывает только фокус карточки товара
          />
        </div>

      </div>
    </div>
  );
}
