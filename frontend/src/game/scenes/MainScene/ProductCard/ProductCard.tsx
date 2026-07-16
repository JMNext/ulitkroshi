import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import eatIcon from '/src/assets/buttom_menu-icons/eat.svg';
import './ProductCardUI.css';
import { useShopStore } from '../useShopStore';

interface ProductCardProps {
  onCloseCard: () => void;
}

export const ProductCard = ({ onCloseCard }: ProductCardProps) => {
  const selectedItem = useShopStore((state) => state.selectedItem);
  const cart = useShopStore((state) => state.cart);

  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    setQuantity(1);
  }, [selectedItem]);

  if (!selectedItem) {
    return (
      <main className="product-card-placeholder">
        <Typography.Text className="text-4xl mb-2 select-none block">👉</Typography.Text>
        <Typography.Paragraph className="text-sm font-bold max-w-[240px]">
          Выберите любой буст слева, чтобы посмотреть описание и добавить его в корзину
        </Typography.Paragraph>
      </main>
    );
  }

  const countInCart = cart[selectedItem.id] || 0;
  const isInCart = countInCart > 0;

  const handleDecrease = () => setQuantity((q) => q - 1);
  const handleIncrease = () => setQuantity((q) => q + 1);

  return (
    <main className="product-card-container">
      <button onClick={onCloseCard} className="product-card-close-btn">✕</button>

      <section className="product-card-scroll-block">
        <nav className="product-card-img-box">
          <img src={eatIcon} className="product-card-img" alt="selected-eat" />
        </nav>
        
        <Typography.Title level={4} className="product-card-title">{selectedItem.name}</Typography.Title>
        
        <Typography.Paragraph className="product-card-price-row">
          {selectedItem.price}
          <img src={eatIcon} className="w-[16px] h-[16px] shrink-0 pointer-events-none" alt="coin" /> / шт.
        </Typography.Paragraph>
        
        <Typography.Paragraph className="product-card-desc-text">
          {selectedItem.description}
        </Typography.Paragraph>
        
        {isInCart && (
          <nav className="product-card-cart-status">
            <Typography.Text>В корзине: <strong className="font-bold">{countInCart} шт.</strong></Typography.Text>
            <button onClick={() => useShopStore.getState().removeFromCart(selectedItem.id)} className="product-card-remove-btn">Удалить</button>
          </nav>
        )}
      </section>

      <section className="product-card-controls-panel">
        <nav className="product-card-counter-row">
          <button disabled={quantity <= 1} onClick={handleDecrease} className="product-card-counter-btn">-</button>
          <Typography.Text className="product-card-counter-value">{quantity}</Typography.Text>
          <button onClick={handleIncrease} className="product-card-counter-btn">+</button>
        </nav>

        <nav className="product-card-subtotal-row">
          <Typography.Text>Стоимость пачки:</Typography.Text>
          <Typography.Text className="product-card-subtotal-value">
            {selectedItem.price * quantity}
            <img src={eatIcon} className="w-[14px] h-[14px] shrink-0 pointer-events-none" alt="coin" />
          </Typography.Text>
        </nav>

        <button onClick={() => useShopStore.getState().addToCart(selectedItem.id, quantity)} className="product-card-submit-btn">
          {isInCart ? 'Добавить еще' : 'Добавить в корзину'}
        </button>
      </section>
    </main>
  );
};
