import { StateCreator } from "zustand";
import { DYNAMIC_BOOSTS, INVENTORY_SLOT_MAP } from "../../constants/shop.constants";
import { CartState, ShopStateCombined } from "../useShopStore";

export const createCartSlice: StateCreator<ShopStateCombined, [], [], CartState> = (set, get) => ({
  selectedItem: null, cart: {}, purchaseStatus: null, inventoryConflict: null,

  setSelectedItem: (selectedItem) => set({ selectedItem }),
  setPurchaseStatus: (purchaseStatus) => set({ purchaseStatus }),
  setInventoryConflict: (inventoryConflict) => set({ inventoryConflict }),

  addToCart: (id, qty) => {
    const item = DYNAMIC_BOOSTS.find((b) => b.id === id);
    if (!item) return false;

    const slot = INVENTORY_SLOT_MAP[item.type];
    const current = { ...get().cart };

    Object.keys(current).forEach((cId) => {
      const cNum = Number(cId);
      if (cNum !== id && INVENTORY_SLOT_MAP[DYNAMIC_BOOSTS.find((b) => b.id === cNum)?.type || ""] === slot) delete current[cNum];
    });

    current[id] = (current[id] || 0) + qty;
    set({ purchaseStatus: null, cart: current });
    return true;
  },

  updateCartQuantity: (id, qty) => {
    if (!DYNAMIC_BOOSTS.some((b) => b.id === id)) return false;
    const slot = INVENTORY_SLOT_MAP[DYNAMIC_BOOSTS.find((b) => b.id === id)!.type];
    const current = { ...get().cart };

    if (qty > (current[id] || 0)) {
      Object.keys(current).forEach((cId) => {
        const cNum = Number(cId);
        if (cNum !== id && INVENTORY_SLOT_MAP[DYNAMIC_BOOSTS.find((b) => b.id === cNum)?.type || ""] === slot) delete current[cNum];
      });
    }

    if (qty <= 0) delete current[id];
    else current[id] = qty;

    set({ cart: current, purchaseStatus: null });
    return true;
  },

  removeFromCart: (id) => set((s) => {
    const cart = { ...s.cart };
    delete cart[id];
    return { cart, purchaseStatus: null };
  }),

  clearCart: () => set({ cart: {} }),

  getTotalPrice: () => Math.round(
    Object.entries(get().cart).reduce((sum, [id, qty]) => sum + (DYNAMIC_BOOSTS.find((b) => b.id === Number(id))?.price || 0) * qty, 0)
  )
});
