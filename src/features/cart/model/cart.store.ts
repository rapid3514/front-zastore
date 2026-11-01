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
  size?: string
}

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, size?: string) => void
  removeItem: (productId: string, size?: string) => void
  increaseQuantity: (productId: string, size?: string) => void
  decreaseQuantity: (productId: string, size?: string) => void
  setQuantity: (productId: string, quantity: number, size?: string) => void
  clearCart: () => void
}

function matchesItem(item: CartItem, productId: string, size?: string) {
  return item.productId === productId && (item.size ?? '') === (size?.trim() ?? '')
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity = 1, size?: string) => set((state) => {
        if (!canOrderProduct(product)) return state
        const qty = Math.max(1, Math.floor(quantity))
        const trimmedSize = size?.trim() || undefined
        const existing = state.items.find((item) => matchesItem(item, product.id, trimmedSize))
        if (existing) {
          return {
            items: state.items.map((item) =>
              matchesItem(item, product.id, trimmedSize)
                ? {
                    ...item,
                    quantity: item.quantity + qty,
                    availabilityStatus: product.availabilityStatus,
                    cargoPrice: product.cargoPrice,
                    price: product.price,
                  }
                : item,
            ),
          }
        }
        return {
          items: [
            ...state.items,
            {
              productId: product.id,
              name: product.name,
              category: product.category.name,
              imageUrl: getProductCoverUrl(product),
              price: product.price,
              cargoPrice: product.cargoPrice,
              quantity: qty,
              availabilityStatus: product.availabilityStatus,
              size: trimmedSize,
            },
          ],
        }
      }),
      removeItem: (productId, size) =>
        set((state) => ({ items: state.items.filter((item) => !matchesItem(item, productId, size)) })),
      increaseQuantity: (productId, size) =>
        set((state) => ({
          items: state.items.map((item) =>
            matchesItem(item, productId, size) ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        })),
      decreaseQuantity: (productId, size) =>
        set((state) => ({
          items: state.items.map((item) =>
            matchesItem(item, productId, size)
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item,
          ),
        })),
      setQuantity: (productId, quantity, size) =>
        set((state) => ({
          items: state.items.map((item) =>
            matchesItem(item, productId, size)
              ? { ...item, quantity: Math.max(1, Math.floor(quantity) || 1) }
              : item,
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'zastore-shop-cart-v3',
      version: 2,
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState) => {
        const previous = persistedState as {
          items?: Array<
            Omit<CartItem, 'availabilityStatus'> & {
              availabilityStatus?: ProductAvailabilityStatus
              isAvailable?: boolean
              size?: string
            }
          >
        }
        return {
          items: (previous.items ?? []).map((item): CartItem => ({
            productId: item.productId,
            name: item.name,
            imageUrl: item.imageUrl,
            price: item.price,
            cargoPrice: item.cargoPrice,
            quantity: item.quantity,
            category: item.category,
            availabilityStatus:
              item.availabilityStatus ?? (item.isAvailable === false ? 'OUT_OF_STOCK' : 'IN_STOCK'),
            size: item.size?.trim() || undefined,
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
