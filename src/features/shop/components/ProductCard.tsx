import { Heart, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '@/features/catalog/api/products.api'
import { useCartStore } from '@/features/cart/model/cart.store'
import { useWishlistStore } from '@/features/catalog/model/wishlist.store'
import { formatCargoPrice, formatMoney } from '@/shared/lib/format'
import { getProductCoverImage } from '@/features/catalog/lib/product-media'
import { availabilityLabel, canOrderProduct } from '@/features/catalog/lib/product-availability'
import { telegramHaptic } from '@/shared/telegram/telegram'
import { useToastStore } from '@/shared/ui/toast-store'
import { ShopImage } from './ShopImage'

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const isFavorite = useWishlistStore((state) => state.isFavorite(product.id))
  const toggleFavorite = useWishlistStore((state) => state.toggleFavorite)
  const showToast = useToastStore((state) => state.show)
  const canOrder = canOrderProduct(product)
  const cover = getProductCoverImage(product)

  function handleAddToCart() {
    addItem(product)
    telegramHaptic('medium')
    showToast(`“${product.name}” savatga qo‘shildi ✅`)
  }

  function handleToggleFavorite(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    const added = toggleFavorite(product.id)
    telegramHaptic('light')
    showToast(added ? 'Sevimlilarga qo‘shildi ❤️' : 'Sevimlilardan olib tashlandi')
  }

  return (
    <article className={`shop-product-card glass-card ${canOrder ? '' : 'opacity-60'}`}>
      <div className="relative overflow-hidden rounded-t-[inherit]">
        <Link to={`/product/${product.id}`} className="block overflow-hidden" aria-label={`${product.name} tafsilotlari`}>
          <ShopImage name={product.name} imageUrl={cover.src} srcSet={cover.srcSet} className="aspect-[4/4.5] w-full transition-transform duration-300 hover:scale-105" />
        </Link>
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`shop-favorite-mark transition-colors active:scale-90 ${isFavorite ? 'text-rose-500 fill-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
          aria-label={isFavorite ? 'Sevimlilardan o‘chirish' : 'Sevimlilarga qo‘shish'}
        >
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        {!canOrder ? <span className="shop-discount">Sotuvda yo‘q</span> : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <p className="shop-muted truncate text-xs font-semibold">{product.category.name}</p>
        <Link to={`/product/${product.id}`} className="mt-1 min-h-10 text-sm font-bold leading-5 text-inherit no-underline hover:text-[var(--shop-accent-strong)] sm:text-base">
          {product.name}
        </Link>
        <p className={`mt-1 text-xs font-bold ${product.availabilityStatus === 'ARRIVING_IN_14_DAYS' ? 'text-amber-700 dark:text-amber-400' : 'shop-muted'}`}>
          {availabilityLabel(product.availabilityStatus)}
        </p>
        {product.availabilityStatus === 'ARRIVING_IN_14_DAYS' && product.cargoPrice ? (
          <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            Kargo: {formatCargoPrice(product.cargoPrice)}
          </p>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-1 pt-3">
          <p className="text-sm font-black sm:text-base">{formatMoney(product.price)}</p>
          <button
            type="button"
            disabled={!canOrder}
            onClick={handleAddToCart}
            className="shop-add-button transition-transform active:scale-95"
            aria-label={`${product.name}ni savatga qo‘shish`}
          >
            <Plus size={19} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
