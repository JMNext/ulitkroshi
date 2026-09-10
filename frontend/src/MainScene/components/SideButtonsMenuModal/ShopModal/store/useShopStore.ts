import { create } from "zustand";
import { usePetStore } from "@/MainScene/components/PetCharacter/store/usePetStore";
import { DYNAMIC_BOOSTS, INVENTORY_SLOT_MAP } from "../shop.constants";
import { useApiStore } from "@/api/store/useApiStore";

export interface BoostItem {
  id: number;
  name: string;
  price: number;
  type: string;
  description: string;
}

interface ShopState {
  selectedItem: BoostItem | null;
  cart: { [key: number]: number };
  purchaseStatus: { success: boolean; text: string } | null;
  setSelectedItem: (item: BoostItem | null) => void;
  setPurchaseStatus: (status: { success: boolean; text: string } | null) => void;
  addToCart: (id: number, qty: number) => boolean;
  updateCartQuantity: (id: number, qty: number) => boolean;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  resetStore: () => void;
  getTotalPrice: () => number;
  checkout: () => Promise<void>;
}

const initialValues = {
  selectedItem: null,
  cart: {},
  purchaseStatus: null
};

const ERROR_CONFLICT = "В корзине уже находится другой фрукт для этого слота инвентаря!";
const ERROR_NO_COINS = "Недостаточно монет для покупки!";

const checkCartConflict = (targetId: number, currentCart: { [key: number]: number }): boolean => {
  const targetItem = DYNAMIC_BOOSTS.find((b) => b.id === targetId);
  if (!targetItem) return false;

  const targetSlot = INVENTORY_SLOT_MAP[targetItem.type];

  return Object.keys(currentCart).some((cartIdStr) => {
    const cartId = Number(cartIdStr);
    if (cartId === targetId) return false;
    const cartItem = DYNAMIC_BOOSTS.find((b) => b.id === cartId);
    return cartItem && INVENTORY_SLOT_MAP[cartItem.type] === targetSlot;
  });
};

export const useShopStore = create<ShopState>((set, get) => ({
  ...initialValues,
  setSelectedItem: (selectedItem) => set({ selectedItem }),
  setPurchaseStatus: (purchaseStatus) => set({ purchaseStatus }),

  addToCart: (id, qty) => {
    if (checkCartConflict(id, get().cart)) {
      set({ purchaseStatus: { success: false, text: ERROR_CONFLICT } });
      return false;
    }
    set((s) => ({
      purchaseStatus: null,
      cart: { ...s.cart, [id]: (s.cart[id] || 0) + qty }
    }));
    return true;
  },

  updateCartQuantity: (id, qty) => {
    if (qty > (get().cart[id] || 0) && checkCartConflict(id, get().cart)) {
      set({ purchaseStatus: { success: false, text: ERROR_CONFLICT } });
      return false;
    }
    set((s) => {
      const cart = { ...s.cart };
      if (qty <= 0) delete cart[id];
      else cart[id] = qty;
      return { cart, purchaseStatus: null };
    });
    return true;
  },

  removeFromCart: (id) =>
    set((s) => {
      const cart = { ...s.cart };
      delete cart[id];
      return { cart, purchaseStatus: null };
    }),

  clearCart: () => set({ cart: {} }),
  resetStore: () => set(initialValues),
  getTotalPrice: () =>
    Object.entries(get().cart).reduce(
      (sum, [id, qty]) => sum + (DYNAMIC_BOOSTS.find((b) => b.id === Number(id))?.price || 0) * qty,
      0
    ),

  checkout: async () => {
    const { cart, getTotalPrice, clearCart, setSelectedItem } = get();
    const total = getTotalPrice();

    if (!Object.keys(cart).length) {
      set({ purchaseStatus: { success: false, text: "В корзине пусто!" } });
      return;
    }

    const auth = useApiStore.getState();
    if (auth.coins < total) {
      set({ purchaseStatus: { success: false, text: ERROR_NO_COINS } });
      return;
    }

    try {
      // Используем новый безопасный метод executeAction вместо прямого spendCoins
      // Передаем тип действия. Сервер/мок спишет монеты на основе переданных метаданных или корзины
      const success = await auth.executeAction('buy_shop_items');
      
      if (!success) {
        set({ purchaseStatus: { success: false, text: ERROR_NO_COINS } });
        return;
      }

      Object.entries(cart).forEach(([idStr, qty]) => {
        const id = Number(idStr);
        const item = DYNAMIC_BOOSTS.find((b) => b.id === id);
        if (item) {
          const slotId = INVENTORY_SLOT_MAP[item.type];
          const pet = usePetStore.getState();

          if ((pet.fruitsCounts[slotId] ?? 0) > 0 && pet.activeFruitIds[slotId] !== id) {
            usePetStore.setState((s) => ({
              fruitsCounts: { ...s.fruitsCounts, [slotId]: qty },
              activeFruitIds: { ...s.activeFruitIds, [slotId]: id }
            }));
          } else {
            pet.addFruitsToInventory(slotId, id, qty);
          }
        }
      });

      clearCart();
      setSelectedItem(null);
      set({ purchaseStatus: { success: true, text: `Успешно куплено! Списано: ${total}` } });
      auth.fetchCoins();
    } catch {
      set({ purchaseStatus: { success: false, text: "Ошибка при списании монет." } });
    }
  }
}));
