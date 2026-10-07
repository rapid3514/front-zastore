import { ArrowLeft, Loader2, MapPin, Package, Phone, RotateCcw } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useCancelOrder, useMyOrder } from '@/features/orders/hooks/use-orders'
import { ConfirmationDeadline } from '@/features/orders/components/ConfirmationDeadline'
import { getOrderStatusClass, orderStatusLabels } from '@/features/orders/lib/order-status'
import { OrderPaymentCard } from '@/features/payments/components/OrderPaymentCard'
import { normalizeApiError } from '@/shared/api/api-error'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import { useToastStore } from '@/shared/ui/toast-store'

function OrderDetailSkeleton() {
  return <div className="space-y-4" aria-label="Buyurtma yuklanmoqda">
    {[1, 2, 3].map((item) => <div key={item} className="glass-card animate-pulse space-y-3 p-5"><div className="h-5 w-2/5 rounded bg-slate-200" /><div className="h-4 w-full rounded bg-slate-100" /><div className="h-4 w-3/4 rounded bg-slate-100" /></div>)}
  </div>
}

export function ShopOrderDetailPage() {
  const { id = '' } = useParams()
  const order = useMyOrder(id)
  const cancel = useCancelOrder()
  const showToast = useToastStore((state) => state.show)

  async function cancelOrder() {
    if (!window.confirm('Buyurtmani bekor qilmoqchimisiz?')) return
    try {
      await cancel.mutateAsync({ id })
      showToast('Buyurtma bekor qilindi')
    } catch (error) {
      showToast(normalizeApiError(error).message, 'error')
    }
  }

  return <main className="page-container shop-page space-y-5">
    <Link to="/orders" className="shop-back"><ArrowLeft size={17} /> Buyurtmalarga qaytish</Link>
    {order.isLoading ? <OrderDetailSkeleton /> : null}
    {order.isError ? <div className="glass-card p-8 text-center"><p className="font-semibold text-red-600">Buyurtmani yuklab bo‘lmadi.</p><Button type="button" variant="outline" className="mt-4" onClick={() => void order.refetch()}><RotateCcw className="size-4" /> Qayta urinish</Button></div> : null}
    {order.data ? <>
      <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="shop-muted text-xs font-bold uppercase tracking-wider">Buyurtma tafsilotlari</p><h1 className="shop-page-title mt-1">#{order.data.id.slice(0, 8)}</h1><p className="shop-muted mt-1 text-sm">{formatDateTime(order.data.createdAt)}</p></div><span className={`order-status ${getOrderStatusClass(order.data.status)}`}>{orderStatusLabels[order.data.status]}</span></header>
      <section className="glass-card space-y-3 p-5">
        <h2 className="font-black">Mahsulotlar</h2>
        {order.data.items.map((item) => <div key={item.id} className="flex justify-between gap-4 border-t border-[var(--app-border)] pt-3 text-sm"><span className="min-w-0">{item.productName} × {item.quantity}<small className="shop-muted mt-1 block">Bir dona: {formatMoney(item.unitPrice)}</small></span><strong className="shrink-0">{formatMoney(item.lineTotal)}</strong></div>)}
        <div className="flex justify-between border-t border-[var(--app-border)] pt-4 text-lg"><span>Jami</span><strong>{formatMoney(order.data.total)}</strong></div>
        <ConfirmationDeadline value={order.data.confirmationDeadline} status={order.data.status} />
      </section>
      <section className="glass-card space-y-3 p-5">
        <h2 className="font-black">Yetkazib berish</h2>
        <p className="flex items-start gap-2 text-sm"><Phone className="mt-0.5 size-4 shrink-0" />{order.data.phone ?? 'Telefon ko‘rsatilmagan'}</p>
        <p className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 size-4 shrink-0" />{order.data.deliveryAddress ?? 'Manzil ko‘rsatilmagan'}</p>
        {order.data.btcPostBranchNumber ? <p className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 size-4 shrink-0" />BTC pochta filiali: {order.data.btcPostBranchNumber}</p> : null}
        {order.data.note ? <p className="shop-muted text-sm">Izoh: {order.data.note}</p> : null}
        {order.data.cancelReason ? <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">Bekor qilish sababi: {order.data.cancelReason}</p> : null}
      </section>
      <OrderPaymentCard orderId={order.data.id} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="shop-muted flex items-center gap-2 text-xs"><Package className="size-4" /> To‘liq ID: {order.data.id}</span>
        {order.data.status === 'PENDING_CONFIRMATION' ? <Button type="button" variant="outline" disabled={cancel.isPending} onClick={() => void cancelOrder()}>{cancel.isPending ? <Loader2 className="size-4 animate-spin" /> : null}Bekor qilish</Button> : null}
      </div>
    </> : null}
  </main>
}
