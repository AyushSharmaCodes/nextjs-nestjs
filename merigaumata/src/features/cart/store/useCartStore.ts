import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartStore, CartItem } from '../types/cart.types';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item: CartItem) => {
        const { items } = get();
        const existingItemIndex = items.findIndex((i) => i.id === item.id && i.variant === item.variant);
        
        let newItems = [...items];
        if (existingItemIndex > -1) {
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + item.quantity
          };
        } else {
          newItems.push(item);
        }
        set({ items: newItems, isOpen: true });
      },
      removeItem: (id, variant) => {
        set({ items: get().items.filter((i) => !(i.id === id && i.variant === variant)) });
      },
      updateQuantity: (id, quantity, variant) => {
        set({
          items: get().items.map((i) =>
            i.id === id && i.variant === variant ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'nexus-cart-storage',
      // keep `isOpen` out of localstorage persistence so checking out doesn't persist visual state
      partialize: (state) => ({ items: state.items }),
    }
  )
);
