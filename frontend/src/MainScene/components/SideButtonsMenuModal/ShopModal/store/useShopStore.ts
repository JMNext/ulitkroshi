import { create, StoreApi } from "zustand";
import { createCartSlice } from "./slices/cart.slice";
import { createCheckoutSlice } from "./slices/checkout.slice";

export interface BoostItem {
  id: number;
  name: string;
  price: number;
  type: string;
  description: string;
}

export interface CustomMainGameStore extends StoreApi<unknown> {
  getState: () => { resetStore?: () => void };
}

export interface CartState {
  selectedItem: BoostItem | null;
  cart: { [key: number]: number };
  purchaseStatus: { success: boolean; text: string } | null;
  setSelectedItem: (item: BoostItem | null) => void;
  setPurchaseStatus: (status: { success: boolean; text: string } | null) => void;
  addToCart: (id: number, qty: number) => boolean;
  updateCartQuantity: (id: number, qty: number) => boolean;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export interface CheckoutState {
  checkout: () => Promise<void>;
}

export interface ShopStateCombined extends CartState, CheckoutState {
  resetStore: () => void;
}

const initialValues = {
  selectedItem: null,
  cart: {},
  purchaseStatus: null
};

export const useShopStore = create<ShopStateCombined>()((set, get, ...a) => ({
  ...createCartSlice(set, get, ...a),
  ...createCheckoutSlice(set, get, ...a),

  resetStore: () => set(initialValues)
}));
