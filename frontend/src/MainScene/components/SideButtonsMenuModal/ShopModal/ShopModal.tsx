import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useShopStore } from "./store/useShopStore";
import { ShopHeader } from "./components/ShopHeader";
import { ShopFooter } from "./components/ShopFooter";
import { ShopCatalogView } from "./ShopCatalogView";
import { ShopCartList } from "./ShopCartList";
import { ProductCard } from "./ProductCard";
import { CloseButton } from "@/ModalWrapper/CloseButton";

interface ShopModalProps {
  onClose: () => void;
}

export const ShopModal = ({ onClose }: ShopModalProps) => {
  const {
    selectedItem,
    purchaseStatus,
    cart,
    resetStore,
    setPurchaseStatus,
    setSelectedItem
  } = useShopStore();

  const [isCartView, setIsCartView] = useState(false);

  const handleClose = () => {
    resetStore?.();
    onClose();
  };

  useEffect(() => {
    if (!purchaseStatus) return;
    const timer = setTimeout(() => setPurchaseStatus?.(null), 3200);
    return () => clearTimeout(timer);
  }, [purchaseStatus, setPurchaseStatus]);

  useEffect(() => {
    const totalItemsInCart = Object.values(cart || {}).reduce((sum, qty) => sum + qty, 0);
    if (totalItemsInCart === 0 && isCartView && !purchaseStatus) {
      setIsCartView(false);
    }
  }, [cart, isCartView, purchaseStatus]);

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none">
          <div 
            className="relative box-border flex h-[92vh] max-h-[740px] w-[calc(100vw-24px)] max-w-[840px] flex-col justify-start overflow-visible rounded-[36px] border-[6px] border-[#7cb342] bg-white p-4 shadow-2xl sm:w-[94vw] sm:p-5 font-black origin-center max-[550px]:landscape:scale-[0.75] max-[550px]:landscape:h-[95vh] max-[550px]:landscape:shadow-lg"
            style={{ fontFamily: "'Arteks-Forced', sans-serif" }}
          >
            <Dialog.Close asChild>
              <CloseButton className="absolute top-3 right-3 z-30" />
            </Dialog.Close>

            <Dialog.Title className="sr-only">Магазин питомцев</Dialog.Title>

            <ShopHeader 
              isCartView={isCartView} 
              setIsCartView={setIsCartView} 
              setPurchaseStatus={setPurchaseStatus} 
            />

            {purchaseStatus && (
              <div className={`animate-fade-in mt-2 box-border flex h-auto min-h-9 w-full shrink-0 items-center justify-center rounded-2xl border-[3px] p-1.5 text-center text-[12px] leading-tight font-black tracking-tight break-words whitespace-normal uppercase shadow-[0_3px_0_rgba(0,0,0,0.05)] sm:text-[13px] sm:tracking-wider antialiased select-none ${
                purchaseStatus.success ? "border-[#81c784] bg-emerald-50 text-[#2e7d32]" : "border-[#e57373] bg-[#ffebee] text-[#c62828]"
              }`}>
                {purchaseStatus.success ? "🎉 " : "✨ "} {purchaseStatus.text}
              </div>
            )}

            <div className="relative mt-2 flex h-0 w-full grow items-stretch overflow-hidden sm:mt-3">
              <div className="h-full w-full overflow-hidden">
                {isCartView ? <ShopCartList /> : <ShopCatalogView onSelected={() => setPurchaseStatus?.(null)} />}
              </div>
            </div>

            <ShopFooter isCartView={isCartView} />

            {selectedItem && (
              <ProductCard onClose={() => setSelectedItem?.(null)} />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
