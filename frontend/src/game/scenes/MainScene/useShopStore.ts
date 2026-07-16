import { create } from 'zustand';

export interface BoostItem {
  id: number;
  name: string;
  price: number;
  description: string;
}

interface ShopState {
  selectedItem: BoostItem | null;
  cart: { [key: number]: number };
  purchaseStatus: { success: boolean; text: string } | null;
  
  setSelectedItem: (item: BoostItem | null) => void;
  addToCart: (id: number, qty: number) => void;
  removeFromCart: (id: number) => void;
  setPurchaseStatus: (status: { success: boolean; text: string } | null) => void;
  clearCart: () => void;
  resetStore: () => void;
}

const initialValues = {
  selectedItem: null,
  cart: {},
  purchaseStatus: null,
};

export const useShopStore = create<ShopState>((set) => ({
  ...initialValues,
  setSelectedItem: (selectedItem) => set({ selectedItem }),
  addToCart: (id, qty) => set((state) => ({
    purchaseStatus: null,
    cart: { ...state.cart, [id]: (state.cart[id] || 0) + qty }
  })),
  removeFromCart: (id) => set((state) => {
    const updated = { ...state.cart };
    delete updated[id];
    return { cart: updated, purchaseStatus: null };
  }),
  setPurchaseStatus: (purchaseStatus) => set({ purchaseStatus }),
  clearCart: () => set({ cart: {} }),
  resetStore: () => set(initialValues),
}));
