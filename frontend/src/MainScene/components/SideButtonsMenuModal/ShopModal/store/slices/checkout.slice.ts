import { useApiStore } from "@/api/store/useApiStore";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { useMainGameStore } from "@/MainScene/store/useMainGameStore";
import { StateCreator } from "zustand";
import { DYNAMIC_BOOSTS, INVENTORY_SLOT_MAP } from "../../constants/shop.constants";
import { CheckoutState, ShopStateCombined } from "../useShopStore";

export const createCheckoutSlice: StateCreator<ShopStateCombined, [], [], CheckoutState> = (set, get) => ({
  checkout: async (forceOverride = false) => {
    const { cart, getTotalPrice, clearCart, setSelectedItem, setInventoryConflict } = get();
    const total = Math.round(getTotalPrice());

    if (!Object.keys(cart).length) return set({ purchaseStatus: { success: false, text: "В корзине пусто!" } });
    if (total <= 0) return set({ purchaseStatus: { success: false, text: "Некорректная сумма покупки!" } });

    const petStore = usePetStore.getState();
    if (!forceOverride) {
      let conflict = false, oldName = "", newName = "";

      Object.keys(cart).forEach((idStr) => {
        const id = Number(idStr), item = DYNAMIC_BOOSTS.find((b) => b.id === id);
        if (!item) return;
        const slot = INVENTORY_SLOT_MAP[item.type], actId = petStore.inventory.activeIds[slot];
        if ((petStore.inventory.counts[slot] ?? 0) > 0 && actId !== undefined && actId !== id) {
          conflict = true;
          oldName = DYNAMIC_BOOSTS.find((b) => b.id === actId)?.name || "Предыдущий фрукт";
          newName = item.name;
        }
      });

      if (conflict) {
        return setInventoryConflict({ conflictingName: oldName, newName, onConfirm: () => { setInventoryConflict(null); get().checkout(true); } });
      }
    }

    const auth = useApiStore.getState(), mainGame = useMainGameStore.getState();
    if (mainGame.coins < total) return set({ purchaseStatus: { success: false, text: "Недостаточно монет для покупки!" } });

    if ((useMainGameStore as any).getState().resetStore) Object.assign(useMainGameStore.getState(), { isUpdatingCoinsGlobal: true });

    try {
      if (!await auth.executeAction("buy_shop_items", total)) return set({ purchaseStatus: { success: false, text: "Недостаточно монет для покупки!" } });

      Object.entries(cart).forEach(([idStr, qty]) => {
        const id = Number(idStr), item = DYNAMIC_BOOSTS.find((b) => b.id === id);
        if (item) {
          const slot = INVENTORY_SLOT_MAP[item.type];
          usePetStore.setState((s) => ({
            inventory: { ...s.inventory, counts: { ...s.inventory.counts, [slot]: qty }, activeIds: { ...s.inventory.activeIds, [slot]: id } }
          }));
        }
      });

      const nextCoins = Math.max(0, Math.round(mainGame.coins - total));
      useMainGameStore.setState({ coins: nextCoins });
      if (auth.user) auth.coins = nextCoins;

      clearCart(); setSelectedItem(null);
      set({ purchaseStatus: { success: true, text: `Успешно куплено! Списано: ${total}` } });
    } catch {
      set({ purchaseStatus: { success: false, text: "Ошибка при списании монет." } });
    }
  }
});
