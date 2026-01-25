import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "./products";

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, step: number) => void;
  removeItem: (productId: string, step: number) => void;
  updateItemColor: (productId: string, color: string) => void;
  clearCart: () => void;
}

// ЭКСПОРТ useCart ДОЛЖЕН БЫТЬ ТУТ:
export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, step) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + step } : i
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity: step, selectedColor: "" }] };
        }),
      removeItem: (productId, step) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === productId);
          if (existingItem && existingItem.quantity > step) {
            return {
              items: state.items.map((i) =>
                i.id === productId ? { ...i, quantity: i.quantity - step } : i
              ),
            };
          }
          return { items: state.items.filter((i) => i.id !== productId) };
        }),
      updateItemColor: (productId, color) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === productId ? { ...i, selectedColor: color } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "cart-storage" }
  )
);
