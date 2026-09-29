import { CloseButton } from "@/CloseButton/CloseButton";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { clsx } from "clsx";
import { useState, useLayoutEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { DYNAMIC_BOOSTS, getGroupStyles, INVENTORY_SLOT_MAP } from "../constants/shop.constants";
import { useShopStore } from "../store/useShopStore";
import { ProductActionControls } from "./ProductActionControls";
import { ProductImage } from "./ProductImage";
import { ProductInfo } from "./ProductInfo";
import { ShopConflictModal } from "./ShopConflictModal";

const QuantitySelector = ({ count, onMinus, onPlus }: { count: number; onMinus: () => void; onPlus: () => void }) => (
  <div className="box-border flex h-[34px] items-center justify-between rounded-xl border-[3px] border-slate-200 bg-white px-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
    <button type="button" onClick={onMinus} disabled={count === 0} className="flex cursor-pointer items-center justify-center border-none bg-transparent pb-1 text-[22px] font-black text-slate-400 outline-none select-none disabled:opacity-50">-</button>
    <span className="text-[15px] font-black text-slate-700 antialiased">{count}</span>
    <button type="button" onClick={onPlus} className="flex cursor-pointer items-center justify-center border-none bg-transparent p-0 pb-1 text-[22px] font-black text-slate-400 outline-none select-none">+</button>
  </div>
);

export const ProductCard = ({ onClose }: { onClose: () => void }) => {
  const { selectedItem, cart, removeFromCart, addToCart, updateCartQuantity, checkout, clearCart } = useShopStore();
  const [showWarning, setShowWarning] = useState(false);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    if (!selectedItem) return;
    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const el = document.querySelector(".phaser-ui-root-container");
      const ps = el ? parseFloat(getComputedStyle(el).getPropertyValue("--game-scale")) || 1 : 1;
      setScale(h > w ? (w >= 768 ? Math.max(ps, (w * 0.55) / 330) : Math.max(0.65, Math.min(1.0, (w * 0.9) / 330))) : (w >= 1024 && h >= 768 ? Math.min(1.0, Math.max(ps, (h * 0.65) / 480)) : (h * 0.88) / 480));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [selectedItem]);

  if (!selectedItem) return null;

  const item = DYNAMIC_BOOSTS.find((b) => b.id === selectedItem.id) || selectedItem;
  const count = cart[item.id] || 0;
  const styles = getGroupStyles(item.type);
  const slot = INVENTORY_SLOT_MAP[item.type];

  const getActiveId = () => usePetStore.getState().inventory.activeIds[slot];
  const checkConflict = () => (usePetStore.getState().inventory.counts[slot] ?? 0) > 0 && getActiveId() !== undefined && getActiveId() !== item.id;

  const handleInstantBuy = async () => {
    if (count > 0) { checkout(); return onClose(); }
    if (checkConflict()) return setShowWarning(true);
    if (addToCart(item.id, 1)) checkout();
    onClose();
  };

  const handleForcedBuy = async () => {
    clearCart();
    usePetStore.setState((s) => ({
      inventory: { ...s.inventory, counts: { ...s.inventory.counts, [slot]: 0 }, activeIds: { ...s.inventory.activeIds, [slot]: item.id } }
    }));
    if (addToCart(item.id, 1)) await checkout(true);
    onClose();
  };

  const handleAdd = () => count > 0 ? updateCartQuantity(item.id, count + 1) : addToCart(item.id, 1);

  return (
    <Dialog.Root open={!!selectedItem} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[1px]" />

        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 origin-center outline-none select-none pointer-events-auto focus:outline-none"
          style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          <div className={clsx(
            "relative flex h-auto w-[320px] flex-col items-center overflow-visible rounded-[32px] border-[5px] border-solid bg-[#fffef5] p-5 shadow-none max-sm:w-[330px] max-sm:p-4",
            styles.popup
          )}>
            <Dialog.Close asChild>
              <CloseButton className="absolute top-4 right-4 z-40 cursor-pointer" />
            </Dialog.Close>
            <Dialog.Title className="sr-only">Детали товара {item.name}</Dialog.Title>

            {showWarning ? (
              <ShopConflictModal isOpen conflictType="inventory" conflictingItemName={DYNAMIC_BOOSTS.find((b) => b.id === getActiveId())?.name || "Предыдущий фрукт"} newItemName={item.name} onConfirm={handleForcedBuy} onCancel={() => setShowWarning(false)} />
            ) : (
              <div className="box-border flex w-full flex-col items-center justify-start gap-4 bg-transparent p-0">
                <ProductImage id={item.id} cardStyle={styles.card} />
                <div className="flex w-full flex-1 flex-col items-center justify-start gap-3.5">
                  <ProductInfo name={item.name} type={item.type} price={item.price} description={item.description} />
                  <div className="box-border flex w-full flex-col gap-2">
                    <QuantitySelector count={count} onMinus={() => count <= 1 ? removeFromCart(item.id) : updateCartQuantity(item.id, count - 1)} onPlus={handleAdd} />
                    <ProductActionControls countInCart={count} totalPrice={item.price * count} onInstantBuy={handleInstantBuy} onAddToCart={handleAdd} onRemoveFromCart={() => removeFromCart(item.id)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
