import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  favoriteIds: string[]
  toggleFavorite: (productId: string) => boolean
  isFavorite: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (productId: string) => {
        const isFav = get().favoriteIds.includes(productId)
        if (isFav) {
          set({ favoriteIds: get().favoriteIds.filter((id) => id !== productId) })
          return false
        } else {
          set({ favoriteIds: [...get().favoriteIds, productId] })
          return true
        }
      },
      isFavorite: (productId: string) => get().favoriteIds.includes(productId),
    }),
    {
      name: 'zastore-wishlist-v1',
    },
  ),
)
