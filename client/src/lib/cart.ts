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

// ВОТ ЭТА СТРОЧКА ДОЛЖНА БЫТЬ ТАКОЙ:
export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, step) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === product.id || (i as any).id === product.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                (i.productId === product.id || (i as any).id === product.id) ? { ...i, quantity: i.quantity + step } : i
              ),
            };
          }
          return { items: [...state.items, { ...product, productId: product.id, quantity: step, selectedColor: "" }] };
        }),
      removeItem: (productId, step) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === productId || (i as any).id === productId);
          if (existingItem && existingItem.quantity > step) {
            return {
              items: state.items.map((i) =>
                (i.productId === productId || (i as any).id === productId) ? { ...i, quantity: i.quantity - step } : i
              ),
            };
          }
          return { items: state.items.filter((i) => i.productId !== productId && (i as any).id !== productId) };
        }),
      updateItemColor: (productId, color) =>
        set((state) => ({
          items: state.items.map((i) =>
            (i.productId === productId || (i as any).id === productId) ? { ...i, selectedColor: color } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "cart-storage" }
  )
);
