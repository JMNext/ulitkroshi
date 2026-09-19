import { CloseButton } from "@/CloseButton/CloseButton";
import * as Dialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { useState } from "react";
import { DYNAMIC_BOOSTS, getGroupStyles, INVENTORY_SLOT_MAP } from "../constants/shop.constants";
import { useShopStore } from "../store/useShopStore";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { ShopConflictModal } from "./ShopConflictModal";
import { ProductImage } from "./ProductImage";
import { ProductInfo } from "./ProductInfo";
import { ProductActionControls } from "./ProductActionControls";

interface ProductCardProps {
  onClose: () => void;
}

const QuantitySelector = ({ count, onMinus, onPlus }: { count: number; onMinus: () => void; onPlus: () => void }) => (
  <div className="box-border flex h-[34px] items-center justify-between rounded-xl border-[3px] border-slate-200 bg-white px-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]">
    <button type="button" onClick={onMinus} disabled={count === 0} className="flex cursor-pointer items-center justify-center border-none bg-transparent pb-1 text-[22px] font-black text-slate-400 transition-transform outline-none active:scale-77 disabled:opacity-50">-</button>
    <span className="text-[15px] font-black text-slate-700 antialiased">{count}</span>
    <button type="button" onClick={onPlus} className="flex cursor-pointer items-center justify-center border-none bg-transparent p-0 pb-1 text-[22px] font-black text-slate-400 transition-transform active:scale-77">+</button>
  </div>
);

export const ProductCard = ({ onClose }: ProductCardProps) => {
  const { selectedItem, cart, removeFromCart, addToCart, updateCartQuantity, checkout, clearCart } = useShopStore();
  const [showInstantBuyWarning, setShowInstantBuyWarning] = useState(false);

  if (!selectedItem) return null;

  const fullItem = DYNAMIC_BOOSTS.find((b) => b.id === selectedItem.id) || selectedItem;
  const countInCart = cart[fullItem.id] || 0;
  const groupStyles = getGroupStyles(fullItem.type);
  const targetSlot = INVENTORY_SLOT_MAP[fullItem.type];

  const checkInventoryConflict = (): boolean => {
    const petInventory = usePetStore.getState().inventory;
    const currentActiveIdInSlot = petInventory.activeIds[targetSlot];
    const currentCountInSlot = petInventory.counts[targetSlot] ?? 0;
    return currentCountInSlot > 0 && currentActiveIdInSlot !== undefined && currentActiveIdInSlot !== fullItem.id;
  };

  const getConflictingInventoryItemName = (): string => {
    const petInventory = usePetStore.getState().inventory;
    const currentActiveIdInSlot = petInventory.activeIds[targetSlot];
    return DYNAMIC_BOOSTS.find((b) => b.id === currentActiveIdInSlot)?.name || "Предыдущий фрукт";
  };

  const executeForcedInstantBuy = async () => {
    clearCart();

    usePetStore.setState((s) => ({
      inventory: {
        ...s.inventory,
        counts: { ...s.inventory.counts, [targetSlot]: 0 },
        activeIds: { ...s.inventory.activeIds, [targetSlot]: fullItem.id }
      }
    }));

    if (addToCart(fullItem.id, 1)) {
      await checkout(true);
    }
    onClose();
  };

  const handleInstantBuyClick = () => {
    if (countInCart > 0) {
      checkout();
      onClose();
      return;
    }

    if (checkInventoryConflict()) {
      setShowInstantBuyWarning(true);
    } else {
      if (addToCart(fullItem.id, 1)) checkout();
      onClose();
    }
  };

  const handleAddToCartClick = () => {
    if (countInCart > 0) {
      updateCartQuantity(fullItem.id, countInCart + 1);
    } else {
      addToCart(fullItem.id, 1);
    }
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none">
          <div className={clsx("animate-bounce-in flex h-auto w-[320px] origin-center flex-col items-center overflow-visible rounded-[32px] border-[5px] border-solid bg-[#fffef5] p-5 shadow-[0_14px_0_rgba(0,0,0,0.15)] max-sm:w-[330px] max-sm:scale-95 max-sm:rounded-[24px] max-sm:p-4", groupStyles.popup)}>
            <Dialog.Close asChild>
              <CloseButton onClick={onClose} className="absolute top-3 right-3 z-30" />
            </Dialog.Close>

            {showInstantBuyWarning ? (
              <ShopConflictModal
                isOpen={showInstantBuyWarning}
                conflictType="inventory"
                conflictingItemName={getConflictingInventoryItemName()}
                newItemName={fullItem.name}
                onConfirm={executeForcedInstantBuy}
                onCancel={() => setShowInstantBuyWarning(false)}
              />
            ) : (
              <>
                <Dialog.Title className="sr-only">Карточка товара {fullItem.name}</Dialog.Title>
                <div className="box-border flex w-full flex-col items-center justify-start gap-4 bg-transparent p-0 select-none">
                  <ProductImage id={fullItem.id} cardStyle={groupStyles.card} />
                  <div className="flex w-full flex-1 flex-col items-center justify-start">
                    <ProductInfo name={fullItem.name} type={fullItem.type} price={fullItem.price} description={fullItem.description} />
                    <div className="mt-3.5 box-border flex w-full flex-col gap-2">
                      <QuantitySelector count={countInCart} onMinus={() => countInCart <= 1 ? removeFromCart(fullItem.id) : updateCartQuantity(fullItem.id, countInCart - 1)} onPlus={handleAddToCartClick} />
                      <ProductActionControls
                        countInCart={countInCart}
                        totalPrice={fullItem.price * countInCart}
                        onInstantBuy={handleInstantBuyClick}
                        onAddToCart={handleAddToCartClick}
                        onRemoveFromCart={() => removeFromCart(fullItem.id)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
