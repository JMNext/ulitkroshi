import React, { useState, useEffect } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ProductCard, BoostItem } from './ProductCard';
import eatIcon from '/src/assets/buttom_menu-icons/eat.svg';

let shopRoot: Root | null = null;
const CONTAINER_ID = 'shop-modal-overlay';

const MOCK_BOOSTS: BoostItem[] = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  name: `Супер-Буст #${i + 1}`,
  price: 50 + (i * 15),
  description: `Полезная еда для улитки. Мгновенно убирает чувство голода, восстанавливает силы и дает бонус к росту на +${(i + 1) * 3}%.`,
}));

export const showShopModal = (): void => {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.getElementById('game-container')?.appendChild(container);
  }
  if (!shopRoot) shopRoot = createRoot(container);
  shopRoot.render(<ShopModalComponent />);
};

export const hideShopModal = (): void => {
  if (shopRoot) { shopRoot.unmount(); shopRoot = null; }
  document.getElementById(CONTAINER_ID)?.remove();
};

const ShopModalComponent = () => {
  const [selectedItem, setSelectedItem] = useState<BoostItem | null>(null);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [coinsBalance, setCoinsBalance] = useState<number>(1500);
  const [purchaseStatus, setPurchaseStatus] = useState<{ success: boolean; text: string } | null>(null);
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const totalPrice = Object.entries(cart).reduce((total, [idStr, qty]) => {
    const item = MOCK_BOOSTS.find(b => b.id === Number(idStr));
    return total + (item ? item.price * qty : 0);
  }, 0);
  
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

  const isPortrait = dims.width < dims.height;
  const isLandscapeTablet = !isPortrait && (dims.width / dims.height) < 1.72;
  const isUltraNarrow = isPortrait && (dims.width / dims.height) < 0.5;

  let shopScale = 1.0;
  if (isUltraNarrow) {
    shopScale = Math.min(dims.width / 380, 0.9);
  } else if (isLandscapeTablet) {
    shopScale = dims.height < 650 ? 0.76 : 0.86;
  }

  const gridColsClass = isUltraNarrow ? 'grid-cols-2' : 'grid-cols-3 md:grid-cols-4';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 pointer-events-auto flex items-center justify-center p-3 sm:p-4 h-[100dvh] box-border overflow-hidden">
      <div 
        style={{ transform: `scale(${shopScale})`, transformOrigin: 'center center' }}
        className="bg-white rounded-[32px] p-5 sm:p-6 w-full max-w-[880px] h-[85vh] md:h-[80vh] flex gap-5 shadow-2xl border-4 border-[#4caf50] relative box-border transition-all duration-150"
      >
        <div className="flex-1 flex flex-col min-h-0 box-border">
          <div className="flex justify-between items-center mb-2 box-border">
            <div className="flex items-center gap-3 sm:gap-4 box-border">
              <h3 className="text-[#1a3d1c] font-black text-xl sm:text-2xl m-0 select-none">Магазин бустов</h3>
              <div className="bg-amber-50 border border-amber-200 px-2.5 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-black text-amber-700 flex items-center gap-1 shadow-sm select-none box-border">
                Баланс: {coinsBalance}
                <img src={eatIcon} className="w-[14px] h-[14px] shrink-0 pointer-events-none" alt="coin" />
              </div>
            </div>
            <button onClick={() => hideShopModal()} style={{ touchAction: 'manipulation' }} className="text-slate-400 hover:text-slate-600 text-2xl font-bold p-1 cursor-pointer transition-colors active:scale-95 border-none bg-transparent outline-none select-none">✕</button>
          </div>

          {purchaseStatus && (
            <div className={`mb-2 p-2 text-center text-[11px] sm:text-xs font-black rounded-xl border flex items-center justify-center gap-1 shrink-0 box-border ${
              purchaseStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {purchaseStatus.text}
              {purchaseStatus.success && <img src={eatIcon} className="w-[12px] h-[12px] shrink-0 pointer-events-none" alt="coin" />}
            </div>
          )}
          
          <div className={`grid ${gridColsClass} gap-2.5 sm:gap-3 overflow-y-auto pr-1 py-1.5 flex-1 box-border scrollbar-thin`}>
            {MOCK_BOOSTS.map((item) => {
              const countInCart = cart[item.id] || 0;
              const isSelected = selectedItem?.id === item.id;
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  style={{ touchAction: 'manipulation' }}
                  className={`aspect-square bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl flex flex-col items-center justify-between p-2 border-2 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all relative box-border ${
                    isSelected ? 'border-[#4caf50] bg-emerald-50/30' : 'border-slate-200'
                  }`}
                >
                  {countInCart > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#4caf50] text-white font-black text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full shadow-sm z-10 leading-none">{countInCart}</span>
                  )}
                  <img src={eatIcon} className="w-[50%] max-w-[55px] aspect-square object-contain mt-1 pointer-events-none" alt="eat" />
                  <span className="text-[11px] font-black text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-sm leading-none mb-0.5 flex items-center gap-0.5 select-none box-border">
                    {item.price}
                    <img src={eatIcon} className="w-[11px] h-[11px] shrink-0 pointer-events-none" alt="coin-icon" />
                  </span>
                </div>
              );
            })}
          </div>

          {!isCartEmpty && (
            <div className="mt-2.5 p-2.5 bg-slate-50 rounded-2xl border border-solid border-slate-100 flex justify-between items-center shrink-0 box-border">
              <div className="flex flex-col select-none">
                <span className="text-[10px] sm:text-xs text-slate-500 font-bold leading-none mb-0.5">Итого к оплате:</span>
                <span className="text-lg sm:text-xl font-black text-emerald-600 flex items-center gap-1 leading-none">
                  {totalPrice}
                  <img src={eatIcon} className="w-[16px] h-[16px] shrink-0 pointer-events-none" alt="coin" />
                </span>
              </div>
              <button onClick={handleCheckoutPurchase} className="h-9 sm:h-11 px-4 sm:px-6 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-black rounded-xl shadow-[0_3px_0_#c78200] active:translate-y-[2px] active:shadow-none transition-all text-xs sm:text-sm cursor-pointer border-none outline-none uppercase tracking-wide flex items-center justify-center box-border">Купить</button>
            </div>
          )}
        </div>

        <div className={`
          bg-slate-50 rounded-2xl p-4 border border-solid border-slate-200 flex flex-col relative box-border transition-all duration-300 ease-out
          md:relative md:w-[320px] md:translate-x-0 md:opacity-100 md:flex md:z-10
          ${selectedItem 
            ? 'fixed inset-x-5 bottom-5 top-5 opacity-100 translate-x-0 z-40' 
            : 'fixed inset-x-5 bottom-5 top-5 opacity-0 translate-x-full pointer-events-none z-0 md:opacity-0 md:pointer-events-none md:absolute'
          }
        `}>
          <ProductCard selectedItem={selectedItem} cart={cart} onAddToCart={handleAddToCart} onRemoveFromCart={handleRemoveFromCart} onCloseCard={() => setSelectedItem(null)} />
        </div>
      </div>
    </div>
  );
};
