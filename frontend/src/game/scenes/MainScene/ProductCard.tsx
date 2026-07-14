import React, { useState, useEffect } from 'react';
import eatIcon from '/src/assets/buttom_menu-icons/eat.svg';

export interface BoostItem {
  id: number;
  name: string;
  price: number;
  description: string;
}

interface ProductCardProps {
  selectedItem: BoostItem | null;
  cart: { [key: number]: number };
  onAddToCart: (id: number, quantity: number) => void;
  onRemoveFromCart: (id: number) => void;
  onCloseCard: () => void;
}

export const ProductCard = ({
  selectedItem,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onCloseCard
}: ProductCardProps) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [dims, setDims] = useState({ height: typeof window !== 'undefined' ? window.innerHeight : 768 });

  useEffect(() => {
    const handleResize = () => setDims({ height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setQuantity(1);
  }, [selectedItem]);

  if (!selectedItem) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-4 box-border">
        <div className="text-3xl sm:text-4xl mb-2 select-none">👉</div>
        <p className="text-xs sm:text-sm font-bold max-w-[240px]">Выберите любой буст слева, чтобы посмотреть описание и добавить его в корзину</p>
      </div>
    );
  }

  const countInCart = cart[selectedItem.id] || 0;
  const isInCart = countInCart > 0;

  const handleDecrease = () => setQuantity((q) => q - 1);
  const handleIncrease = () => setQuantity((q) => q + 1);
  const handleRemove = () => onRemoveFromCart(selectedItem.id);
  const handleAdd = () => onAddToCart(selectedItem.id, quantity);

  // ИСПРАВЛЕНО: Если высота экрана маленькая (Nest Hub < 650px), ужимаем отступы и размеры элементов
  const isShortScreen = dims.height < 650;
  const cardGapClass = isShortScreen ? 'gap-1' : 'gap-1.5';
  const imgBoxSize = isShortScreen ? 'w-[54px] h-[54px] mb-1.5' : 'w-[74px] h-[74px] mb-2.5';
  const imgSize = isShortScreen ? 'w-[40px] h-[40px]' : 'w-[54px] h-[54px]';

  return (
    <div className="flex flex-col h-full justify-between box-border relative">
      <button 
        onClick={onCloseCard} 
        style={{ touchAction: 'manipulation' }}
        className="absolute top-2 right-3 sm:top-3 sm:right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer transition-colors active:scale-95 z-30 border-none bg-transparent p-1 outline-none select-none"
      >
        ✕
      </button>

      {/* ИСПРАВЛЕНО: Контентный блок теперь имеет жесткий min-h-0 и авто-скролл. Кнопки внизу никогда не улетят под экран */}
      <div className="min-h-0 overflow-y-auto flex flex-col pr-1 box-border scrollbar-thin">
        <div className={`${imgBoxSize} bg-white rounded-2xl border-2 border-slate-200/80 flex items-center justify-center mx-auto mt-1 shadow-sm box-border shrink-0`}>
          <img src={eatIcon} className={`${imgSize} object-contain pointer-events-none`} alt="selected-eat" />
        </div>
        
        {/* ИСПРАВЛЕНО: Добавлен px-6, чтобы длинные названия товаров не перекрывали кнопку-крестик */}
        <h4 className={`text-center font-black text-lg sm:text-xl text-[#1a3d1c] mb-0.5 px-6 leading-tight select-none m-0`}>{selectedItem.name}</h4>
        
        <p className="text-center font-black text-base sm:text-lg text-emerald-600 mb-2 flex items-center justify-center gap-1 m-0 select-none">
          {selectedItem.price}
          <img src={eatIcon} className="w-[16px] h-[16px] shrink-0 pointer-events-none" alt="coin" /> / шт.
        </p>
        
        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed bg-white p-2.5 sm:p-3 rounded-xl border border-slate-100 shadow-inner m-0">
          {selectedItem.description}
        </p>
        
        {isInCart && (
          <div className="mt-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded-xl p-2 sm:p-2.5 flex justify-between items-center animate-fade-in shrink-0 box-border">
            <span>В корзине: <b>{countInCart} шт.</b></span>
            <button 
              onClick={handleRemove}
              style={{ touchAction: 'manipulation' }}
              className="text-red-500 hover:text-red-700 font-black underline cursor-pointer border-none bg-transparent p-0 outline-none"
            >
              Удалить
            </button>
          </div>
        )}
      </div>

      {/* Нижний закрепленный блок управления */}
      <div className={`pt-2.5 border-t border-solid border-slate-100 bg-slate-50/50 shrink-0 box-border ${isShortScreen ? 'mt-2' : 'mt-3.5'}`}>
        <div className="flex items-center justify-center gap-4 mb-2.5 box-border">
          <button 
            disabled={quantity <= 1}
            onClick={handleDecrease}
            style={{ touchAction: 'manipulation' }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-solid border-slate-300 flex items-center justify-center font-black font-mono text-slate-600 disabled:opacity-30 active:scale-95 transition-transform cursor-pointer p-0 outline-none"
          >
            -
          </button>
          <span className="font-black text-lg sm:text-xl text-slate-700 w-8 text-center select-none">{quantity}</span>
          <button 
            onClick={handleIncrease}
            style={{ touchAction: 'manipulation' }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-solid border-slate-300 flex items-center justify-center font-black font-mono text-slate-600 active:scale-90 transition-transform cursor-pointer p-0 outline-none"
          >
            +
          </button>
        </div>

        <div className="flex justify-between items-center mb-2.5 px-1 text-xs sm:text-sm font-black text-slate-700 select-none">
          <span>Стоимость пачки:</span>
          <span className="text-sm sm:text-base text-emerald-600 flex items-center gap-1 font-extrabold">
            {selectedItem.price * quantity}
            <img src={eatIcon} className="w-[14px] h-[14px] shrink-0 pointer-events-none" alt="coin" />
          </span>
        </div>

        <button 
          onClick={handleAdd}
          style={{ touchAction: 'manipulation' }}
          className="w-full h-10 sm:h-11 bg-gradient-to-b from-[#4caf50] to-[#388e3c] text-white font-black rounded-xl shadow-[0_3px_0_#2e7d32] active:translate-y-[2px] active:shadow-none transition-all text-xs sm:text-sm cursor-pointer border-none outline-none uppercase tracking-wide flex items-center justify-center box-border"
        >
          {isInCart ? 'Добавить еще' : 'Добавить в корзину'}
        </button>
      </div>
    </div>
  );
};
