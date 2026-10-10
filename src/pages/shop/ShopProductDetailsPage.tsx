import { useState } from 'react'
import { ArrowLeft, Heart, Minus, Plus, ShoppingBag } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useCartStore } from '@/features/cart/model/cart.store'
import { useProduct } from '@/features/catalog/hooks/use-products'
import { availabilityLabel, canOrderProduct } from '@/features/catalog/lib/product-availability'
import { ProductMediaGallery } from '@/features/shop/components/ProductMediaGallery'
import { formatMoney } from '@/shared/lib/format'

export function ShopProductDetailsPage() {
  const { id = '' } = useParams()
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)
  const query = useProduct(id)

  if (query.isLoading) return <main className="page-container shop-page"><div className="glass-card h-80 animate-pulse" /></main>
  if (query.isError || !query.data) return <main className="page-container shop-page"><div className="glass-card p-8 text-center"><h1 className="text-xl font-bold">Mahsulot topilmadi</h1><Link to="/catalog" className="shop-more mt-4">Katalogga qaytish</Link></div></main>

  const product = query.data
  const canOrder = canOrderProduct(product)

  function addToCart() {
    for (let index = 0; index < quantity; index += 1) addItem(product)
  }

  return (
    <main className="page-container shop-page shop-product-detail">
      <div className="shop-detail-media">
        <ProductMediaGallery product={product} />
        <Link to="/catalog" className="shop-detail-circle shop-detail-back" aria-label="Katalogga qaytish"><ArrowLeft size={19} /></Link>
        <span className="shop-detail-circle shop-detail-heart" aria-hidden="true"><Heart size={19} /></span>
      </div>
      <section className="shop-detail-copy glass-card">
        <span className="shop-sale-pill">{product.category.name}</span>
        <h1>{product.name}</h1>
        <strong className="shop-detail-price">{formatMoney(product.price)}</strong>
        {product.availabilityStatus === 'ARRIVING_IN_14_DAYS' && product.cargoPrice ? <p className="text-sm font-semibold text-amber-700">Kargo narxi: {formatMoney(product.cargoPrice)} (buyurtma jamiga kirmaydi)</p> : null}
        <p>{product.description || 'Mahsulot uchun tavsif kiritilmagan.'}</p>
        <span className={`shop-availability ${canOrder ? 'shop-availability-open' : ''}`}>{availabilityLabel(product.availabilityStatus)}</span>
        <div className="shop-detail-actions">
          <div className="shop-quantity"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Miqdorni kamaytirish"><Minus size={16} /></button><span>{quantity}</span><button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Miqdorni oshirish"><Plus size={16} /></button></div>
          <button type="button" disabled={!canOrder} onClick={addToCart} className="shop-primary-button flex-1"><ShoppingBag size={17} /> Savatga qo‘shish</button>
        </div>
      </section>
    </main>
  )
}
