import { StateCreator } from "zustand";
import { DYNAMIC_BOOSTS, INVENTORY_SLOT_MAP } from "../../constants/shop.constants";
import { CartState, ShopStateCombined } from "../useShopStore";

const ERROR_CONFLICT = "В корзине уже находится другой фрукт для этого слота инвентаря!";

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

export const createCartSlice: StateCreator<ShopStateCombined, [], [], CartState> = (set, get) => ({
  selectedItem: null,
  cart: {},
  purchaseStatus: null,

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

  getTotalPrice: () =>
    Math.round(
      Object.entries(get().cart).reduce((sum, [id, qty]) => sum + (DYNAMIC_BOOSTS.find((b) => b.id === Number(id))?.price || 0) * qty, 0)
    )
});
