import { useRef, useState } from 'react'
import { ArrowLeft, Loader2, Minus, Plus, ShoppingCart } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useProduct } from '@/features/catalog/hooks/use-products'
import { getProductCoverUrl } from '@/features/catalog/lib/product-media'
import { useCreateOrder } from '@/features/orders/hooks/use-orders'
import { ShopImage } from '@/features/shop/components/ShopImage'
import { normalizeApiError } from '@/shared/api/api-error'
import { formatMoney } from '@/shared/lib/format'
import { useToastStore } from '@/shared/ui/toast-store'

function OrderPageSkeleton() {
  return (
    <main className="page-container shop-page shop-product-detail" aria-label="Mahsulot yuklanmoqda">
      <Skeleton className="aspect-square w-full rounded-[1.35rem]" />
      <div className="glass-card space-y-5 p-5 sm:p-7">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-6 w-2/5" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </main>
  )
}

export function OrderPage() {
  const { productId = '' } = useParams()
  const navigate = useNavigate()
  const productQuery = useProduct(productId)
  const createOrder = useCreateOrder()
  const showToast = useToastStore((state) => state.show)
  const [quantity, setQuantity] = useState(1)
  const [submitError, setSubmitError] = useState('')
  const submitting = useRef(false)

  if (productQuery.isLoading) return <OrderPageSkeleton />

  if (productQuery.isError || !productQuery.data) {
    const error = normalizeApiError(productQuery.error)
    const notFound = error.status === 404
    return (
      <main className="page-container shop-page">
        <div className="glass-card p-8 text-center">
          <h1 className="text-xl font-bold">{notFound ? 'Mahsulot topilmadi' : 'Mahsulotni yuklab bo‘lmadi'}</h1>
          {!notFound ? <p className="shop-muted mt-2 text-sm">{error.message}</p> : null}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {!notFound ? <button type="button" className="shop-primary-button" onClick={() => void productQuery.refetch()}>Qayta urinish</button> : null}
            <Link to="/catalog" className="shop-secondary-button">Katalogga qaytish</Link>
          </div>
        </div>
      </main>
    )
  }

  const product = productQuery.data
  const canOrder = product.isActive && product.isAvailable
  const unitPriceInCents = Math.round(Number(product.price) * 100)
  const total = (unitPriceInCents * quantity) / 100

  async function submitOrder() {
    if (!canOrder || submitting.current || createOrder.isPending) return

    submitting.current = true
    setSubmitError('')
    try {
      const order = await createOrder.mutateAsync({
        items: [{ productId: product.id, quantity }],
      })
      showToast('Buyurtma muvaffaqiyatli yaratildi ✅')
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (error) {
      setSubmitError(normalizeApiError(error).message)
    } finally {
      submitting.current = false
    }
  }

  return (
    <main className="page-container shop-page shop-product-detail">
      <div className="shop-detail-media">
        <ShopImage
          name={product.name}
          imageUrl={getProductCoverUrl(product)}
          className="aspect-square w-full object-cover"
        />
        <Link to="/catalog" className="shop-detail-circle shop-detail-back" aria-label="Katalogga qaytish">
          <ArrowLeft size={19} />
        </Link>
      </div>

      <section className="shop-detail-copy glass-card">
        <span className="shop-sale-pill">To‘g‘ridan-to‘g‘ri buyurtma</span>
        <h1>{product.name}</h1>
        <p className="mt-2 text-sm font-semibold">Narxi</p>
        <strong className="shop-detail-price">{formatMoney(product.price)}</strong>

        <span className={`shop-availability ${canOrder ? 'shop-availability-open' : ''}`}>
          {canOrder ? 'Sotuvda mavjud' : 'Hozirda mavjud emas'}
        </span>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <span className="font-bold">Quantity</span>
            <div className="shop-quantity">
              <button type="button" disabled={quantity <= 1 || createOrder.isPending} onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Miqdorni kamaytirish">
                <Minus size={16} />
              </button>
              <span aria-live="polite">{quantity}</span>
              <button type="button" disabled={!canOrder || createOrder.isPending} onClick={() => setQuantity((value) => value + 1)} aria-label="Miqdorni oshirish">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--app-border)] pt-4 text-lg">
            <span className="font-bold">Jami:</span>
            <strong>{formatMoney(total)}</strong>
          </div>

          {submitError ? <p role="alert" className="text-sm font-semibold text-red-600">{submitError}</p> : null}

          <button type="button" disabled={!canOrder || createOrder.isPending} onClick={() => void submitOrder()} className="shop-primary-button w-full">
            {createOrder.isPending ? <Loader2 className="size-4 animate-spin" /> : <ShoppingCart className="size-4" />}
            {createOrder.isPending ? 'Buyurtma yuborilmoqda...' : 'Zakazni tasdiqlash'}
          </button>
        </div>
      </section>
    </main>
  )
}
