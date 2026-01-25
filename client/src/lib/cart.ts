import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './products';

interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number, selectedColor?: string) => void;
  removeItem: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity, selectedColor) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id && item.selectedColor === selectedColor);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id && item.selectedColor === selectedColor
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity, selectedColor }] });
        }
      },
      removeItem: (productId, selectedColor) =>
        set({ items: get().items.filter((item) => !(item.id === productId && item.selectedColor === selectedColor)) }),
      updateQuantity: (productId, quantity, selectedColor) =>
        set({
          items: get().items.map((item) =>
            item.id === productId && item.selectedColor === selectedColor ? { ...item, quantity } : item
          ),
        }),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'cart-storage',
      // Ensure we don't try to persist non-serializable data if any
    }
  )
);
