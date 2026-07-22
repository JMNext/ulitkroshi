import { useState, useEffect } from 'react';
import { Typography } from 'antd';
import eatIcon from '/src/assets/buttom_menu-icons/eat.svg';
import { useShopStore } from '../useShopStore';

export const ProductCard = ({ onCloseCard }: { onCloseCard: () => void }) => {
  const selectedItem = useShopStore((state) => state.selectedItem);
  const cart = useShopStore((state) => state.cart);

  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    setQuantity(1);
  }, [selectedItem]);

  if (!selectedItem) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 p-6 select-none hidden portrait:hidden landscape:flex">
        <Typography.Text className="text-4xl mb-2 block">👉</Typography.Text>
        <Typography.Paragraph className="text-sm font-bold max-w-[240px]">
          Выберите любой буст слева, чтобы посмотреть описание и добавить его в корзину
        </Typography.Paragraph>
      </div>
    );
  }

  const countInCart = cart[selectedItem.id] || 0;
  const isInCart = countInCart > 0;

  const handleDecrease = () => setQuantity((q) => q - 1);
  const handleIncrease = () => setQuantity((q) => q + 1);

  return (
    <div className="fixed portrait:absolute inset-0 portrait:z-50 landscape:relative flex h-full w-full flex-col bg-slate-50 portrait:bg-white rounded-[24px] border border-slate-200/60 p-5 box-border overflow-hidden select-none">
      <button 
        onClick={onCloseCard} 
        className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-600 transition-colors text-lg font-bold bg-transparent border-none p-1 cursor-pointer outline-none"
      >
        ✕
      </button>

      <div className="flex-1 overflow-y-auto pr-1 flex flex-col items-center mb-4 justify-center portrait:justify-start portrait:pt-6">
        <div className="w-[120px] h-[120px] portrait:w-[140px] portrait:h-[140px] bg-white rounded-[20px] portrait:rounded-[28px] border border-slate-100 flex items-center justify-center p-4 mt-2 shrink-0 shadow-sm">
          <img src={eatIcon} className="w-full h-full object-contain" alt="selected-eat" />
        </div>
        
        <Typography.Title level={4} className="!text-xl portrait:!text-2xl !font-black !text-[#1a3d1c] !mt-4 !mb-1 !text-center !leading-tight !tracking-wide !p-0">
          {selectedItem.name}
        </Typography.Title>
        
        <div className="flex items-center gap-1 text-sm portrait:text-base font-bold text-slate-500 mb-3">
          <span>{selectedItem.price}</span>
          <img src={eatIcon} className="w-[16px] h-[16px] portrait:w-[18px] portrait:h-[18px]" alt="coin" />
          <span>/ шт.</span>
        </div>
        
        <Typography.Paragraph className="text-sm portrait:text-base font-medium text-slate-600 leading-relaxed text-center max-w-[260px] portrait:max-w-[320px] !m-0 !p-0">
          {selectedItem.description}
        </Typography.Paragraph>
        
        {isInCart && (
          <div className="mt-4 w-full max-w-[320px] bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs portrait:text-sm rounded-xl p-2.5 flex items-center justify-between">
            <Typography.Text>В корзине: <strong className="font-bold">{countInCart} шт.</strong></Typography.Text>
            <button 
              onClick={() => useShopStore.getState().removeFromCart(selectedItem.id)} 
              className="text-red-500 hover:text-red-700 transition-colors font-bold underline bg-transparent border-none cursor-pointer outline-none"
            >
              Удалить
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200/80 pt-3 flex flex-col gap-3 shrink-0 w-full max-w-[340px] mx-auto">
        <div className="flex items-center justify-between bg-white border border-slate-200/60 rounded-xl p-1.5">
          <button 
            disabled={quantity <= 1} 
            onClick={handleDecrease} 
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:hover:bg-slate-100 transition-colors text-slate-700 font-black text-lg flex items-center justify-center disabled:opacity-40 p-0 border-none cursor-pointer disabled:cursor-not-allowed outline-none"
          >
            -
          </button>
          <Typography.Text className="font-black text-base text-slate-800">{quantity}</Typography.Text>
          <button 
            onClick={handleIncrease} 
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 font-black text-lg flex items-center justify-center p-0 border-none cursor-pointer outline-none"
          >
            +
          </button>
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
          <Typography.Text>Стоимость пачки:</Typography.Text>
          <Typography.Text className="text-sm font-black text-[#1a3d1c] flex items-center gap-0.5">
            {selectedItem.price * quantity}
            <img src={eatIcon} className="w-[14px] h-[14px]" alt="coin" />
          </Typography.Text>
        </div>

        <button 
          onClick={() => useShopStore.getState().addToCart(selectedItem.id, quantity)} 
          className="w-full h-12 bg-gradient-to-b from-[#ff9800] to-[#f57c00] hover:from-[#f57c00] hover:to-[#e65100] transition-all text-white font-black text-sm rounded-full border-none uppercase tracking-wide flex items-center justify-center cursor-pointer shadow-sm outline-none mb-2"
        >
          {isInCart ? 'Добавить еще' : 'Добавить в корзину'}
        </button>
      </div>
    </div>
  );
};
