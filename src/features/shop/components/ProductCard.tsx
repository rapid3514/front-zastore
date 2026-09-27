import { Heart, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '@/features/catalog/api/products.api'
import { useCartStore } from '@/features/cart/model/cart.store'
import { formatMoney } from '@/shared/lib/format'
import { ShopImage } from './ShopImage'

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const canOrder = product.isActive && product.isAvailable

  return (
    <article className={`shop-product-card glass-card ${canOrder ? '' : 'opacity-60'}`}>
      <Link to={`/product/${product.id}`} className="block overflow-hidden rounded-t-[inherit]" aria-label={`${product.name} tafsilotlari`}>
        <div className="relative">
          <ShopImage name={product.name} imageUrl={product.imageUrl} className="aspect-[4/4.5] w-full" />
          <span className="shop-favorite-mark" aria-hidden="true"><Heart size={16} fill="currentColor" /></span>
          {!canOrder ? <span className="shop-discount">Mavjud emas</span> : null}
        </div>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <p className="shop-muted truncate text-xs font-semibold">{product.category.name}</p>
        <Link to={`/product/${product.id}`} className="mt-1 min-h-10 text-sm font-bold leading-5 text-inherit no-underline sm:text-base">{product.name}</Link>
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
