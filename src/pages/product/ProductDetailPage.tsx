import { Check, ChevronLeft, Plus } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassPill } from '@/components/glass/GlassPill'
import { useProduct } from '@/features/catalog/hooks/use-products'
import { FoodImage } from '@/features/food/ui/FoodImage'
import { cn } from '@/shared/lib/cn'
import { formatPrice } from '@/shared/mock/food-products'
import { useCartStore } from '@/features/cart/model/cart.store'

export function ProductDetailPage() {
  const { id = '' } = useParams()
  const { pathname } = useLocation()
  const back = pathname.startsWith('/admin') ? '/admin/menu' : '/menu'
  const productQuery = useProduct(id)
  const addItem = useCartStore((state) => state.addItem)
  const product = productQuery.data
  const isInCart = useCartStore((state) => state.items.some((item) => item.productId === product?.id))

  if (productQuery.isLoading) return <main className="page-container">Mahsulot yuklanmoqda...</main>
  if (productQuery.isError || !product) return <main className="page-container"><p>Mahsulot topilmadi.</p><Link to={back} className="back-link">Menyuga qaytish</Link></main>

  return (
    <main className="page-container product-detail-page">
      <Link to={back} className="back-link"><ChevronLeft className="size-5" aria-hidden="true" /> Menyuga qaytish</Link>
      <div className="mt-4 grid gap-5 md:grid-cols-[1.05fr_0.95fr]">
        <GlassCard className="overflow-hidden"><FoodImage name={product.name} imageUrl={product.imageUrl} className="aspect-[4/3] w-full" /></GlassCard>
        <GlassCard className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <GlassPill>{product.category.name}</GlassPill>
            <span className={cn('availability-pill', product.isAvailable ? 'availability-pill-open' : 'availability-pill-closed')}>
              {product.isAvailable ? <Check className="size-4" aria-hidden="true" /> : null}{product.isAvailable ? 'Bugun mavjud' : 'Bugun mavjud emas'}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.045em] text-[#352922]">{product.name}</h1>
          {product.description ? <p className="mt-3 text-base leading-7 text-[#806f65]">{product.description}</p> : null}
          <p className="mt-5 text-2xl font-black text-[#d95122]">{formatPrice(Number(product.price))}</p>
          <button type="button" disabled={!product.isAvailable || isInCart} onClick={() => addItem(product)} className="food-primary-button mt-5 flex w-full items-center justify-center gap-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><Plus className="size-5" />{!product.isAvailable ? 'Mavjud emas' : isInCart ? 'Savatda' : 'Savatga qo‘shish'}</button>
        </GlassCard>
      </div>
    </main>
  )
}
