import { CloseButton } from "@/CloseButton/CloseButton";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import * as Dialog from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { useEffect, useState, useLayoutEffect } from "react";

import { ShopCartList } from "./components/ShopCartList";
import { ShopCatalogView } from "./components/ShopCatalogView";
import { ShopConflictModal } from "./ProductCard/ShopConflictModal";
import { ShopFooter } from "./components/ShopFooter";
import { ShopHeader } from "./components/ShopHeader";
import { useShopStore } from "./store/useShopStore";
import { ProductCard } from "@/MainScene/components/SideButtonsMenuModal/ShopModal/ProductCard/ProductCard";


export const ShopModal = NiceModal.create(() => {
  const modal = useModal();
  const { selectedItem, purchaseStatus, cart, inventoryConflict, resetStore, setPurchaseStatus, setSelectedItem, setInventoryConflict } = useShopStore();
  const [isCartView, setIsCartView] = useState(false);
  const [scale, setScale] = useState(1);

  const handleClose = () => { resetStore(); modal.hide(); };

  useLayoutEffect(() => {
    if (!modal.visible) return;
    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      const el = document.querySelector(".phaser-ui-root-container");
      const ps = el ? parseFloat(getComputedStyle(el).getPropertyValue("--game-scale")) || 1 : 1;
      setScale(h > w ? (w >= 768 ? Math.max(ps, (w * 0.55) / 520) : Math.max(0.65, Math.min(1.0, (w * 0.9) / 400))) : (w >= 1024 && h >= 768 ? Math.min(1.0, Math.max(ps, (h * 0.65) / 520)) : (h * 0.88) / 520));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [modal.visible]);

  useEffect(() => {
    if (!purchaseStatus) return;
    const timer = setTimeout(() => setPurchaseStatus(null), 3200);
    return () => clearTimeout(timer);
  }, [purchaseStatus, setPurchaseStatus]);

  useEffect(() => {
    const total = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    if (!total && isCartView && !purchaseStatus) setIsCartView(false);
  }, [cart, isCartView, purchaseStatus]);

  return (
    <Dialog.Root open={modal.visible} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 origin-center outline-none" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
          <div
            className="relative box-border flex h-[92vh] max-h-[740px] w-[calc(100vw-24px)] max-w-[840px] flex-col justify-start gap-4 overflow-visible rounded-[36px] border-[6px] border-[#7cb342] bg-white p-5 font-black shadow-2xl sm:w-[94vw] max-[550px]:landscape:h-[95vh]"
            style={{ fontFamily: "'Arteks-Forced', sans-serif" }}
          >
            <Dialog.Close asChild><CloseButton className="absolute top-5 right-4 z-40 cursor-pointer" /></Dialog.Close>
            <Dialog.Title className="sr-only">Магазин питомцев</Dialog.Title>

            <div className="w-full shrink-0">
              <ShopHeader isCartView={isCartView} setIsCartView={setIsCartView} setPurchaseStatus={(v) => setPurchaseStatus(v ? { success: v === "SUCCESS", text: "" } : null)} />
            </div>

            {purchaseStatus && (
              <div className={clsx(
                "box-border flex h-auto min-h-9 w-full shrink-0 items-center justify-center rounded-2xl border-[3px] p-1.5 text-center text-[12px] leading-tight font-black tracking-tight break-words uppercase shadow-[0_3px_0_rgba(0,0,0,0.05)] select-none sm:text-[13px] sm:tracking-wider",
                purchaseStatus.success ? "border-[#81c784] bg-emerald-50 text-[#2e7d32]" : "border-[#e57373] bg-[#ffebee] text-[#c62828]"
              )}>
                {purchaseStatus.success ? "🎉 " : "✨ "} {purchaseStatus.text}
              </div>
            )}

            <div className="relative flex w-full flex-1 items-stretch overflow-hidden">
              <div className="h-full w-full overflow-hidden">
                {isCartView ? <ShopCartList /> : <ShopCatalogView onSelected={() => setPurchaseStatus(null)} />}
              </div>
            </div>

            <div className="w-full shrink-0"><ShopFooter isCartView={isCartView} setIsCartView={setIsCartView} /></div>

            {/* Карточка продукта теперь рендерится через свой портал и не ломает верстку внутри контейнера */}
            {selectedItem && <ProductCard onClose={() => setSelectedItem(null)} />}

            {/* Модалка конфликта инвентаря переведена на fixed, чтобы отображаться поверх всего экрана */}
            {inventoryConflict && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
                <div className="w-[320px] rounded-[32px] border-[5px] border-solid border-orange-500 bg-[#fffef5] p-5 shadow-2xl">
                  <ShopConflictModal isOpen conflictType="inventory" conflictingItemName={inventoryConflict.conflictingName} newItemName={inventoryConflict.newName} onConfirm={inventoryConflict.onConfirm} onCancel={() => setInventoryConflict(null)} />
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
