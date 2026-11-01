import { useState } from 'react'
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag, Zap } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCartStore } from '@/features/cart/model/cart.store'
import { useProduct } from '@/features/catalog/hooks/use-products'
import { availabilityLabel, canOrderProduct } from '@/features/catalog/lib/product-availability'
import { useWishlistStore } from '@/features/catalog/model/wishlist.store'
import { ProductMediaGallery } from '@/features/shop/components/ProductMediaGallery'
import { SizeSelector } from '@/features/shop/components/SizeSelector'
import { formatCargoPrice, formatMoney } from '@/shared/lib/format'
import { telegramHaptic } from '@/shared/telegram/telegram'
import { useToastStore } from '@/shared/ui/toast-store'

export function ShopProductDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState('M')
  const addItem = useCartStore((state) => state.addItem)
  const isFavorite = useWishlistStore((state) => state.isFavorite(id))
  const toggleFavorite = useWishlistStore((state) => state.toggleFavorite)
  const showToast = useToastStore((state) => state.show)
  const query = useProduct(id)

  if (query.isLoading) return <main className="page-container shop-page"><div className="glass-card h-80 animate-pulse" /></main>
  if (query.isError || !query.data) return <main className="page-container shop-page"><div className="glass-card p-8 text-center"><h1 className="text-xl font-bold">Mahsulot topilmadi</h1><Link to="/catalog" className="shop-more mt-4">Katalogga qaytish</Link></div></main>

  const product = query.data
  const canOrder = canOrderProduct(product)

  function addToCart() {
    addItem(product, quantity, size)
    telegramHaptic('medium')
    const sizeSuffix = size ? ` (${size})` : ''
    showToast(`${quantity} ta “${product.name}${sizeSuffix}” savatga qo‘shildi ✅`)
  }

  function handleToggleFavorite() {
    const added = toggleFavorite(product.id)
    telegramHaptic('light')
    showToast(added ? 'Sevimlilarga qo‘shildi ❤️' : 'Sevimlilardan olib tashlandi')
  }

  function handleDirectBuy() {
    telegramHaptic('medium')
    const queryParam = size ? `?size=${encodeURIComponent(size)}` : ''
    navigate(`/order/${product.id}${queryParam}`)
  }

  return (
    <main className="page-container shop-page shop-product-detail">
      <div className="shop-detail-media relative">
        <ProductMediaGallery product={product} />
        <Link to="/catalog" className="shop-detail-circle shop-detail-back" aria-label="Katalogga qaytish"><ArrowLeft size={19} /></Link>
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`shop-detail-circle shop-detail-heart transition-transform active:scale-90 ${isFavorite ? 'text-rose-500 fill-rose-500' : 'text-slate-600 dark:text-slate-200'}`}
          aria-label={isFavorite ? 'Sevimlilardan o‘chirish' : 'Sevimlilarga qo‘shish'}
        >
          <Heart size={19} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <section className="shop-detail-copy glass-card">
        <span className="shop-sale-pill">{product.category.name}</span>
        <h1 className="mt-2 text-2xl font-black">{product.name}</h1>
        <strong className="shop-detail-price block mt-2 text-2xl font-black text-[var(--shop-accent-strong)]">{formatMoney(product.price)}</strong>
        {product.availabilityStatus === 'ARRIVING_IN_14_DAYS' && product.cargoPrice ? (
          <p className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
            Kargo narxi: {formatCargoPrice(product.cargoPrice)} (buyurtma jamiga kirmaydi)
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-6 opacity-85">{product.description || 'Mahsulot uchun tavsif kiritilmagan.'}</p>
        <span className={`shop-availability mt-3 inline-block ${canOrder ? 'shop-availability-open' : ''}`}>
          {availabilityLabel(product.availabilityStatus)}
        </span>

        {/* Razmer tanlash */}
        <SizeSelector
          value={size}
          onChange={setSize}
          className="mt-5 border-t border-[var(--app-border)] pt-4"
        />

        <div className="shop-detail-actions mt-5">
          <div className="shop-quantity">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Miqdorni kamaytirish"><Minus size={16} /></button>
            <span className="px-2 font-bold">{quantity}</span>
            <button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Miqdorni oshirish"><Plus size={16} /></button>
          </div>
          <button type="button" disabled={!canOrder} onClick={addToCart} className="shop-primary-button shop-detail-cart-btn">
            <ShoppingBag size={17} className="shrink-0" />
            <span>Savatga qo‘shish</span>
          </button>
          {canOrder ? (
            <button type="button" onClick={handleDirectBuy} className="shop-secondary-button shop-detail-buy-btn">
              <Zap size={16} className="shrink-0 text-amber-500 fill-amber-500" />
              <span>Hozir xarid qilish</span>
            </button>
          ) : null}
        </div>
      </section>
    </main>
  )
}
