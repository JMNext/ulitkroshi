import React, { useState, useEffect } from 'react';

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

export function ProductCard({
  selectedItem,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onCloseCard
}: ProductCardProps) {
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    setQuantity(1);
  }, [selectedItem]);

  if (!selectedItem) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-4">
        <div className="text-4xl mb-2">👉</div>
        <p className="text-sm font-medium">Выберите любой буст слева, чтобы посмотреть описание и добавить его в корзину</p>
      </div>
    );
  }

  const countInCart = cart[selectedItem.id] || 0;
  const isInCart = countInCart > 0;

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Кнопка закрытия только карточки товара */}
      <button 
        onClick={onCloseCard} 
        className="absolute top-3 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer transition-colors active:scale-95"
      >
        ✕
      </button>

      <div className="min-h-0 overflow-y-auto">
        <div className="w-[80px] h-[80px] bg-white rounded-2xl border-2 border-slate-200 flex items-center justify-center mx-auto mb-3 mt-2 shadow-sm">
          <img src="/assets/buttom_menu-icons/eat.svg" className="w-[60px] h-[60px] object-contain" alt="selected-eat" />
        </div>
        <h4 className="text-center font-bold text-xl text-[#1a3d1c] mb-1">{selectedItem.name}</h4>
        <p className="text-center font-extrabold text-lg text-emerald-600 mb-3 flex items-center justify-center gap-1">
          {selectedItem.price}
          <img src="/assets/buttom_menu-icons/eat.svg" className="w-[16px] h-[16px] shrink-0" alt="coin" /> / шт.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed bg-white p-3 rounded-xl border border-slate-100 shadow-inner">
          {selectedItem.description}
        </p>
        
        {isInCart && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] rounded-xl p-2.5 flex justify-between items-center animate-fade-in">
            <span>В корзине: <b>{countInCart} шт.</b></span>
            <button 
              onClick={() => onRemoveFromCart(selectedItem.id)}
              className="text-red-500 hover:text-red-700 font-bold underline cursor-pointer"
            >
              Удалить
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-center gap-4 mb-3">
          <button 
            disabled={quantity <= 1}
            onClick={() => setQuantity(q => q - 1)}
            className="w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold font-mono text-slate-600 disabled:opacity-40 active:scale-95 transition-transform cursor-pointer"
          >
            -
          </button>
          <span className="font-bold text-xl text-slate-700 w-8 text-center">{quantity}</span>
          <button 
            onClick={() => setQuantity(q => q + 1)}
            className="w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold font-mono text-slate-600 active:scale-90 transition-transform cursor-pointer"
          >
            +
          </button>
        </div>

        <div className="flex justify-between items-center mb-3 px-1 text-sm font-bold text-slate-700">
          <span>Стоимость пачки:</span>
          <span className="text-base text-emerald-600 flex items-center gap-1">
            {selectedItem.price * quantity}
            <img src="/assets/buttom_menu-icons/eat.svg" className="w-[14px] h-[14px] shrink-0" alt="coin" />
          </span>
        </div>

        <button 
          onClick={() => onAddToCart(selectedItem.id, quantity)}
          className="w-full h-11 bg-gradient-to-b from-[#4caf50] to-[#388e3c] text-white font-bold rounded-xl shadow-[0_3px_0_#2e7d32] active:translate-y-[2px] active:shadow-none transition-all text-sm cursor-pointer"
        >
          {isInCart ? 'Добавить еще' : 'Добавить в корзину'}
        </button>
      </div>
    </div>
  );
}
