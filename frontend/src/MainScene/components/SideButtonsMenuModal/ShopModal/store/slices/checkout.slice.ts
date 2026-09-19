import { useApiStore } from "@/api/store/useApiStore";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { StateCreator } from "zustand";
import { DYNAMIC_BOOSTS, INVENTORY_SLOT_MAP } from "../../constants/shop.constants";
import { CheckoutState, CustomMainGameStore, ShopStateCombined } from "../useShopStore";

const ERROR_NO_COINS = "Недостаточно монет для покупки!";

export const createCheckoutSlice: StateCreator<ShopStateCombined, [], [], CheckoutState> = (set, get) => ({
  checkout: async (forceInventoryOverride = false) => {
    const { cart, getTotalPrice, clearCart, setSelectedItem, setInventoryConflict } = get();
    const total = Math.round(getTotalPrice());

    if (!Object.keys(cart).length) {
      set({ purchaseStatus: { success: false, text: "В корзине пусто!" } });
      return;
    }

    if (total <= 0) {
      set({ purchaseStatus: { success: false, text: "Некорректная сумма покупки!" } });
      return;
    }

    const petStore = usePetStore.getState();
    if (!forceInventoryOverride) {
      let hasActiveConflict = false;
      let conflictingName = "";
      let newName = "";

      Object.keys(cart).forEach((idStr) => {
        const id = Number(idStr);
        const item = DYNAMIC_BOOSTS.find((b) => b.id === id);
        if (item) {
          const slotId = INVENTORY_SLOT_MAP[item.type];
          const currentActiveId = petStore.inventory.activeIds[slotId];
          const currentCount = petStore.inventory.counts[slotId] ?? 0;

          if (currentCount > 0 && currentActiveId !== undefined && currentActiveId !== id) {
            hasActiveConflict = true;
            conflictingName = DYNAMIC_BOOSTS.find((b) => b.id === currentActiveId)?.name || "Предыдущий фрукт";
            newName = item.name;
          }
        }
      });

      if (hasActiveConflict) {
        setInventoryConflict({
          conflictingName,
          newName,
          onConfirm: () => {
            setInventoryConflict(null);
            get().checkout(true);
          }
        });
        return;
      }
    }

    const auth = useApiStore.getState();
    const mainGame = useMainGameStore.getState();

    if (mainGame.coins < total) {
      set({ purchaseStatus: { success: false, text: ERROR_NO_COINS } });
      return;
    }

    const typedStore = useMainGameStore as unknown as CustomMainGameStore;
    if (typedStore.getState().resetStore) {
      Object.assign(useMainGameStore.getState(), { isUpdatingCoinsGlobal: true });
    }

    try {
      const success = await auth.executeAction("buy_shop_items", total);

      if (!success) {
        set({ purchaseStatus: { success: false, text: ERROR_NO_COINS } });
        return;
      }

      Object.entries(cart).forEach(([idStr, qty]) => {
        const id = Number(idStr);
        const item = DYNAMIC_BOOSTS.find((b) => b.id === id);
        if (item) {
          const slotId = INVENTORY_SLOT_MAP[item.type];
          usePetStore.setState((s) => ({
            inventory: {
              ...s.inventory,
              counts: { ...s.inventory.counts, [slotId]: qty },
              activeIds: { ...s.inventory.activeIds, [slotId]: id }
            }
          }));
        }
      });

      const nextCoins = Math.max(0, Math.round(mainGame.coins - total));
      useMainGameStore.setState({ coins: nextCoins });
      if (auth.user) {
        auth.coins = nextCoins;
      }

      clearCart();
      setSelectedItem(null);
      set({ purchaseStatus: { success: true, text: `Успешно куплено! Списано: ${total}` } });
    } catch (err) {
      console.error("🚨 [SHOP CHECKOUT CATCH ERROR]:", err);
      set({ purchaseStatus: { success: false, text: "Ошибка при списании монет." } });
    } finally {
      setTimeout(() => {
        useMainGameStore.setState({ isVert: useMainGameStore.getState().isVert });
      }, 100);
    }
  }
});
