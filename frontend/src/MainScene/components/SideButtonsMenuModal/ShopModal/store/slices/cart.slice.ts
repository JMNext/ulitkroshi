import { StateCreator } from "zustand";
import { DYNAMIC_BOOSTS, INVENTORY_SLOT_MAP } from "../../constants/shop.constants";
import { CartState, ShopStateCombined } from "../useShopStore";

export const createCartSlice: StateCreator<ShopStateCombined, [], [], CartState> = (set, get) => ({
  selectedItem: null,
  cart: {},
  purchaseStatus: null,
  inventoryConflict: null,

  setSelectedItem: (selectedItem) => set({ selectedItem }),
  setPurchaseStatus: (purchaseStatus) => set({ purchaseStatus }),
  setInventoryConflict: (inventoryConflict) => set({ inventoryConflict }),

  addToCart: (id, qty) => {
    const targetItem = DYNAMIC_BOOSTS.find((b) => b.id === id);
    if (!targetItem) return false;

    const targetSlot = INVENTORY_SLOT_MAP[targetItem.type];
    const currentCart = { ...get().cart };

    Object.keys(currentCart).forEach((cartIdStr) => {
      const cartId = Number(cartIdStr);
      if (cartId !== id) {
        const cartItem = DYNAMIC_BOOSTS.find((b) => b.id === cartId);
        if (cartItem && INVENTORY_SLOT_MAP[cartItem.type] === targetSlot) {
          delete currentCart[cartId];
        }
      }
    });

    currentCart[id] = (currentCart[id] || 0) + qty;
    set({ purchaseStatus: null, cart: currentCart });
    return true;
  },

  updateCartQuantity: (id, qty) => {
    const targetItem = DYNAMIC_BOOSTS.find((b) => b.id === id);
    if (!targetItem) return false;

    const targetSlot = INVENTORY_SLOT_MAP[targetItem.type];
    const currentCart = { ...get().cart };

    if (qty > (currentCart[id] || 0)) {
      Object.keys(currentCart).forEach((cartIdStr) => {
        const cartId = Number(cartIdStr);
        if (cartId !== id) {
          const cartItem = DYNAMIC_BOOSTS.find((b) => b.id === cartId);
          if (cartItem && INVENTORY_SLOT_MAP[cartItem.type] === targetSlot) {
            delete currentCart[cartId];
          }
        }
      });
    }

    if (qty <= 0) delete currentCart[id];
    else currentCart[id] = qty;

    set({ cart: currentCart, purchaseStatus: null });
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
