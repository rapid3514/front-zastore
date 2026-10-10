import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, ProductAvailabilityStatus } from '@/features/catalog/api/products.api'
import { canOrderProduct } from '@/features/catalog/lib/product-availability'
import { getProductCoverUrl } from '@/features/catalog/lib/product-media'

export interface CartItem {
  productId: string
  name: string
  imageUrl?: string | null
  price: string
  cargoPrice?: string | null
  quantity: number
  availabilityStatus: ProductAvailabilityStatus
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
        if (!canOrderProduct(product)) return state
        const existing = state.items.find((item) => item.productId === product.id)
        if (existing) {
          return { items: state.items.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1, availabilityStatus: product.availabilityStatus, cargoPrice: product.cargoPrice, price: product.price } : item) }
        }
        return { items: [...state.items, { productId: product.id, name: product.name, category: product.category.name, imageUrl: getProductCoverUrl(product), price: product.price, cargoPrice: product.cargoPrice, quantity: 1, availabilityStatus: product.availabilityStatus }] }
      }),
      removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      increaseQuantity: (productId) => set((state) => ({ items: state.items.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item) })),
      decreaseQuantity: (productId) => set((state) => ({ items: state.items.map((item) => item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item) })),
      setQuantity: (productId, quantity) => set((state) => ({ items: state.items.map((item) => item.productId === productId ? { ...item, quantity: Math.max(1, Math.floor(quantity) || 1) } : item) })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'zastore-shop-cart-v2',
      version: 1,
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState) => {
        const previous = persistedState as { items?: Array<Omit<CartItem, 'availabilityStatus'> & { availabilityStatus?: ProductAvailabilityStatus; isAvailable?: boolean }> }
        return {
          items: (previous.items ?? []).map((item): CartItem => ({
            productId: item.productId,
            name: item.name,
            imageUrl: item.imageUrl,
            price: item.price,
            cargoPrice: item.cargoPrice,
            quantity: item.quantity,
            category: item.category,
            availabilityStatus: item.availabilityStatus ?? (item.isAvailable === false ? 'OUT_OF_STOCK' : 'IN_STOCK'),
          })),
        }
      },
    },
  ),
)

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0)
}

export function getCartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + Number(item.price) * item.quantity, 0)
}
