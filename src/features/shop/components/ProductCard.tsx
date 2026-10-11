import { Heart, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '@/features/catalog/api/products.api'
import { useCartStore } from '@/features/cart/model/cart.store'
import { formatCargoPrice, formatMoney } from '@/shared/lib/format'
import { getProductCoverImage } from '@/features/catalog/lib/product-media'
import { availabilityLabel, canOrderProduct } from '@/features/catalog/lib/product-availability'
import { ShopImage } from './ShopImage'

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const canOrder = canOrderProduct(product)
  const cover = getProductCoverImage(product)

  return (
    <article className={`shop-product-card glass-card ${canOrder ? '' : 'opacity-60'}`}>
      <Link to={`/product/${product.id}`} className="block overflow-hidden rounded-t-[inherit]" aria-label={`${product.name} tafsilotlari`}>
        <div className="relative">
          <ShopImage name={product.name} imageUrl={cover.src} srcSet={cover.srcSet} className="aspect-[4/4.5] w-full" />
          <span className="shop-favorite-mark" aria-hidden="true"><Heart size={16} fill="currentColor" /></span>
          {!canOrder ? <span className="shop-discount">Sotuvda yo‘q</span> : null}
        </div>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <p className="shop-muted truncate text-xs font-semibold">{product.category.name}</p>
        <Link to={`/product/${product.id}`} className="mt-1 min-h-10 text-sm font-bold leading-5 text-inherit no-underline sm:text-base">{product.name}</Link>
        <p className={`mt-1 text-xs font-bold ${product.availabilityStatus === 'ARRIVING_IN_14_DAYS' ? 'text-amber-700' : 'shop-muted'}`}>{availabilityLabel(product.availabilityStatus)}</p>
        {product.availabilityStatus === 'ARRIVING_IN_14_DAYS' && product.cargoPrice ? <p className="mt-1 text-xs font-semibold text-amber-700">Kargo: {formatCargoPrice(product.cargoPrice)}</p> : null}
        <div className="mt-auto flex items-end justify-between gap-1 pt-3">
          <p className="text-sm font-black sm:text-base">{formatMoney(product.price)}</p>
          <button type="button" disabled={!canOrder} onClick={() => addItem(product)} className="shop-add-button" aria-label={`${product.name}ni savatga qo‘shish`}>
            <Plus size={19} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
