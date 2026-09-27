import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/features/catalog/api/products.api'

export interface CartItem {
  productId: string
  name: string
  imageUrl?: string | null
  price: string
  quantity: number
  isAvailable: boolean
  category?: string
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  increaseQuantity: (productId: string) => void
  decreaseQuantity: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) => set((state) => {
        const existing = state.items.find((item) => item.productId === product.id)
        if (existing) {
          return { items: state.items.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1, isAvailable: product.isAvailable, price: product.price } : item) }
        }
        return { items: [...state.items, { productId: product.id, name: product.name, category: product.category.name, imageUrl: product.imageUrl, price: product.price, quantity: 1, isAvailable: product.isAvailable }] }
      }),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      increaseQuantity: (productId) => set((state) => ({ items: state.items.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item) })),
      decreaseQuantity: (productId) => set((state) => ({ items: state.items.flatMap((item) => item.productId === productId ? (item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []) : [item]) })),
      setQuantity: (productId, quantity) => set((state) => ({ items: state.items.flatMap((item) => item.productId === productId ? (quantity > 0 ? [{ ...item, quantity: Math.floor(quantity) }] : []) : [item]) })),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'zastore-shop-cart-v2', partialize: (state) => ({ items: state.items }) },
  ),
)

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + Number(item.price) * item.quantity, 0)
}
