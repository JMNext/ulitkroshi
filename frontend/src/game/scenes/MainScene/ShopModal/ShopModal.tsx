import React, { useEffect } from 'react';
import { Typography } from 'antd';
import { ProductCard } from '../ProductCard/ProductCard';
import { useMainGameStore } from '../useMainGameStore';
import eatIcon from '/src/assets/buttom_menu-icons/eat.svg';
import './ShopModal.css';
import { BoostItem, useShopStore } from '../useShopStore';

interface ShopModalProps {
  onClose: () => void;
}

const MOCK_BOOSTS: BoostItem[] = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  name: `Супер-Буст #${i + 1}`,
  price: 50 + i * 15,
  description: `Полезная еда для улитки. Мгновенно убирает чувство голода, восстанавливает силы и дает бонус к ростом на +${(i + 1) * 3}%.`,
}));

export const ShopModal = ({ onClose }: ShopModalProps) => {
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

  const handleBackdropClick = (e: React.MouseEvent<HTMLElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const totalPrice = Object.entries(cart).reduce((total, [idStr, qty]) => {
    const item = MOCK_BOOSTS.find((b) => b.id === Number(idStr));
    return total + (item ? item.price * qty : 0);
  }, 0);

  const isCartEmpty = Object.keys(cart).length === 0;

  const handleCheckoutPurchase = () => {
    if (isCartEmpty) return;
    if (coinsBalance < totalPrice) {
      setPurchaseStatus({ success: false, text: 'Недостаточно монет для покупки!' });
      return;
    }
    const newBalance = coinsBalance - totalPrice;
    setCoins(newBalance);
    
    clearCart();
    setSelectedItem(null);
    setPurchaseStatus({ success: true, text: `Успешно куплено! Списано: ${totalPrice}` });
  };

  return (
    <main className="modal-backdrop-blur" onClick={handleBackdropClick}>
      <section className="shop-modal-card">
        <section className="shop-main-column">
          <nav className="shop-header-row">
            <nav className="shop-title-balance-wrap">
              <Typography.Title level={3} className="shop-title">Магазин бустов</Typography.Title>
              <nav className="shop-balance-badge">
                <Typography.Text className="shop-balance-text">
                  Баланс: {coinsBalance}
                </Typography.Text>
                <img src={eatIcon} className="pointer-events-none h-[14px] w-[14px] shrink-0" alt="coin" />
              </nav>
            </nav>
            <button onClick={onClose} className="shop-close-btn">✕</button>
          </nav>

          {purchaseStatus && (
            <nav className={`shop-status-banner ${purchaseStatus.success ? 'shop-status-success' : 'shop-status-error'}`}>
              <Typography.Text className="shop-status-text">{purchaseStatus.text}</Typography.Text>
              {purchaseStatus.success && <img src={eatIcon} className="pointer-events-none h-[12px] w-[12px] shrink-0" alt="coin" />}
            </nav>
          )}

          <nav className="shop-goods-grid">
            {MOCK_BOOSTS.map((item) => {
              const countInCart = cart[item.id] || 0;
              const isSelected = selectedItem?.id === item.id;
              return (
                <section
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`shop-good-card ${isSelected ? 'shop-good-card-selected' : 'shop-good-card-normal'}`}
                >
                  {countInCart > 0 && <span className="shop-good-badge-count">{countInCart}</span>}
                  <img src={eatIcon} className="shop-good-img" alt="eat" />
                  <span className="shop-good-price-lbl">
                    {item.price}
                    <img src={eatIcon} className="pointer-events-none h-[11px] w-[11px] shrink-0" alt="coin-icon" />
                  </span>
                </section>
              );
            })}
          </nav>

          {!isCartEmpty && (
            <nav className="shop-checkout-panel">
              <nav className="shop-checkout-price-wrap">
                <Typography.Text className="shop-checkout-title">Итого к оплате:</Typography.Text>
                <Typography.Text className="shop-checkout-sum">
                  {totalPrice}
                  <img src={eatIcon} className="pointer-events-none h-[16px] w-[16px] shrink-0" alt="coin" />
                </Typography.Text>
              </nav>
              <button onClick={handleCheckoutPurchase} className="shop-checkout-btn">Купить</button>
            </nav>
          )}
        </section>

        <section className="shop-details-column">
          <ProductCard onCloseCard={() => setSelectedItem(null)} />
        </section>
      </section>
    </main>
  );
};
