import { Check, Plus } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/glass/GlassCard'
import type { Product } from '@/features/catalog/api/products.api'
import { cn } from '@/shared/lib/cn'
import { formatPrice } from '@/shared/mock/food-products'
import { useCartStore } from '@/features/cart/model/cart.store'
import { FoodImage } from './FoodImage'

export function FoodProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)
  const isInCart = useCartStore((state) => state.items.some((item) => item.productId === product.id))
  const { pathname } = useLocation()
  const detailUrl = `${pathname.startsWith('/admin') ? '/admin/product' : '/product'}/${product.id}`
  return (
    <GlassCard className={cn('food-product-card flex min-w-0 flex-col overflow-hidden', !product.isAvailable && 'food-product-card-disabled')}>
      <Link to={detailUrl} className="block" aria-label={`${product.name} tafsilotlari`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <FoodImage name={product.name} imageUrl={product.imageUrl} className="size-full" />
          <Badge className="absolute top-2 left-2 bg-white/85 text-[#6f4a35] shadow-sm backdrop-blur-md">{product.category.name}</Badge>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-3.5">
        <Link to={detailUrl} className="min-w-0 text-inherit no-underline">
          <h3 className="truncate text-base font-bold text-[#352922]">{product.name}</h3>
          <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-[#806f65]">{product.description ?? ''}</p>
        </Link>
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-base font-extrabold text-[#d95122]">{formatPrice(Number(product.price))}</p>
            <p className={cn('mt-1 flex items-center gap-1 text-xs font-semibold', product.isAvailable ? 'text-[#2f8f63]' : 'text-[#a07161]')}>
              {product.isAvailable && <Check className="size-3.5" aria-hidden="true" />}
              {product.isAvailable ? 'Bugun mavjud' : 'Bugun mavjud emas'}
            </p>
          </div>
          <button type="button" disabled={!product.isAvailable || isInCart} onClick={() => addItem(product)} className="food-add-button" aria-label={`${product.name}ni savatga qo‘shish`}><Plus className="size-5" /></button>
        </div>
      </div>
    </GlassCard>
  )
}
