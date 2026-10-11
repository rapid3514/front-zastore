import { useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Loader2, MapPin, Phone, ShoppingBag } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { getCartSubtotal, useCartStore } from '@/features/cart/model/cart.store'
import { useCreateOrder } from '@/features/orders/hooks/use-orders'
import { beginCheckoutSubmission, releaseCheckoutSubmission } from '@/features/orders/lib/checkout-submission'
import { normalizeApiError } from '@/shared/api/api-error'
import { formatCargoPrice, formatMoney } from '@/shared/lib/format'
import { OrderSuccessNotice } from './OrderSuccessNotice'

export function CheckoutPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const items = useCartStore((state) => state.items)
  const clearCart = useCartStore((state) => state.clearCart)
  const createOrder = useCreateOrder()
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [btcPostBranchNumber, setBtcPostBranchNumber] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null)
  const submittingRef = useRef(false)
  const subtotal = getCartSubtotal(items)

  if (!items.length) return <Navigate to="/cart" replace />

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (createOrder.isPending || successOrderId) return
    setError('')
    if (!deliveryAddress.trim() || !btcPostBranchNumber.trim()) {
      setError('Yetkazib berish manzili va BTC pochta filial raqamini kiriting.')
      return
    }
    if (items.some((item) => item.availabilityStatus === 'OUT_OF_STOCK')) {
      setError('Mavjud bo‘lmagan mahsulotlarni savatdan olib tashlang.')
      return
    }
    if (!beginCheckoutSubmission(submittingRef)) return
    let succeeded = false
    try {
      const order = await createOrder.mutateAsync({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        deliveryAddress: deliveryAddress.trim(),
        btcPostBranchNumber: btcPostBranchNumber.trim(),
        ...(note.trim() ? { note: note.trim() } : {}),
      })
      succeeded = true
      setSuccessOrderId(order.id)
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    } finally {
      if (!succeeded) releaseCheckoutSubmission(submittingRef)
    }
  }

  function dismissSuccessNotice() {
    if (!successOrderId) return
    clearCart()
    navigate(`/order-success/${successOrderId}`, { replace: true })
  }

  return <main className="page-container shop-page shop-checkout-page">
    <Link to="/cart" className="shop-back"><ArrowLeft size={17} /> Savatga qaytish</Link>
    <h1 className="shop-page-title mt-2">Buyurtma rasmiylashtirish</h1>
    <section className="shop-checkout-notice" aria-labelledby="checkout-notice-title">
      <h2 id="checkout-notice-title"><span aria-hidden="true">💗</span> Ishonchli xarid, xotirjam to‘lov!</h2>
      <ul>
        <li><span aria-hidden="true">🛍</span><p>Buyurtmadan so‘ng administratorimiz siz bilan bog‘lanadi.</p></li>
        <li><span aria-hidden="true">💳</span><p>To‘lov <strong>kelishuvdan keyin</strong> amalga oshiriladi.</p></li>
      </ul>
      <p className="shop-checkout-notice-cta"><span aria-hidden="true">✨</span><strong>Yoqtirgan mahsulotingizni hoziroq buyurtma qiling!</strong></p>
    </section>
    <form onSubmit={submit} className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="glass-card space-y-5 p-4 sm:p-6">
        <label className="shop-field"><span><Phone size={17} /> Telefon raqam</span><input type="tel" maxLength={30} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+998 90 123 45 67" /></label>
        <label className="shop-field"><span><MapPin size={17} /> Yetkazib berish manzili *</span><input required maxLength={255} value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Manzilni kiriting" /></label>
        <label className="shop-field"><span><MapPin size={17} /> BTC pochta filial raqami *</span><input required maxLength={50} value={btcPostBranchNumber} onChange={(event) => setBtcPostBranchNumber(event.target.value)} placeholder="Filial raqamini kiriting" /></label>
        <label className="shop-field"><span>Izoh (ixtiyoriy)</span><textarea maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Masalan: qo‘ng‘iroq qiling..." /></label>
      </div>
      <aside className="shop-checkout-summary glass-card">
        <h2>Buyurtmangiz</h2>
        <div className="space-y-2">{items.map((item) => <div key={item.productId}><p><span>{item.name} × {item.quantity}</span><strong>{formatMoney(Number(item.price) * item.quantity)}</strong></p>{item.availabilityStatus === 'ARRIVING_IN_14_DAYS' && item.cargoPrice ? <p className="text-xs font-semibold text-amber-700">Kargo: {formatCargoPrice(item.cargoPrice)}</p> : null}</div>)}</div>
        <div className="shop-checkout-total"><span>Jami:</span><strong>{formatMoney(subtotal)}</strong></div>
        {items.some((item) => item.availabilityStatus === 'ARRIVING_IN_14_DAYS') ? <p className="text-xs font-semibold text-amber-700">Kargo narxi buyurtma jamiga kiritilmagan.</p> : null}
        {error ? <p role="alert" className="text-sm font-semibold text-red-600">{error}</p> : null}
        <button type="submit" disabled={createOrder.isPending} className="shop-primary-button w-full">{createOrder.isPending ? <Loader2 className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}{createOrder.isPending ? 'Yuborilmoqda...' : <>Tasdiqlash <ArrowRight size={17} /></>}</button>
      </aside>
    </form>
    {successOrderId ? <OrderSuccessNotice orderId={successOrderId} onDismiss={dismissSuccessNotice} /> : null}
  </main>
}
