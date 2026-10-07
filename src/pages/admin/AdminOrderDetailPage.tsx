import { useState } from 'react'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import type { OrderStatus } from '@/features/orders/api/orders.api'
import { useManageOrder, useOrderAdminMutations } from '@/features/orders/hooks/use-orders'
import { getNextAdminStatuses, getOrderStatusClass, orderStatusLabels } from '@/features/orders/lib/order-status'
import { normalizeApiError } from '@/shared/api/api-error'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import { useToastStore } from '@/shared/ui/toast-store'

export function AdminOrderDetailPage() {
  const { id = '' } = useParams()
  const { pathname } = useLocation()
  const basePath = pathname.startsWith('/super-admin') ? '/super-admin' : '/admin'
  const order = useManageOrder(id)
  const { confirm, reject, updateStatus } = useOrderAdminMutations()
  const showToast = useToastStore((state) => state.show)
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null)
  const [showReject, setShowReject] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  if (order.isLoading) return <main className="sa-page-container space-y-4" aria-label="Buyurtma yuklanmoqda">{[1, 2, 3].map((item) => <div key={item} className="sa-glass animate-pulse space-y-3 rounded-3xl p-5"><div className="h-6 w-2/5 rounded bg-slate-200" /><div className="h-4 w-full rounded bg-slate-100" /><div className="h-4 w-3/4 rounded bg-slate-100" /></div>)}</main>
  if (order.isError || !order.data) return <main className="sa-page-container"><p>Buyurtma topilmadi.</p><Link to={`${basePath}/orders`} className="back-link"><ChevronLeft className="size-5" />Buyurtmalarga qaytish</Link></main>

  const item = order.data
  const nextStatuses = getNextAdminStatuses(item.status)

  async function runAction(action: () => Promise<unknown>, success: string) {
    try {
      await action()
      showToast(success)
      await order.refetch()
    } catch (error) {
      showToast(normalizeApiError(error).message, 'error')
    } finally {
      setPendingStatus(null)
    }
  }

  function changeStatus(status: OrderStatus) {
    if (status === 'CANCELLED' && !window.confirm('Buyurtmani bekor qilmoqchimisiz?')) return
    setPendingStatus(status)
    void runAction(() => updateStatus.mutateAsync({ id, status }), `${orderStatusLabels[status]} holatiga o‘tkazildi`)
  }

  async function rejectOrder() {
    const reason = rejectReason.trim()
    setPendingStatus('CANCELLED')
    try {
      await reject.mutateAsync({ id, ...(reason ? { reason } : {}) })
      showToast('Buyurtma rad etildi')
      await order.refetch()
      setShowReject(false)
      setRejectReason('')
    } catch (error) {
      showToast(normalizeApiError(error).message, 'error')
    } finally {
      setPendingStatus(null)
    }
  }

  return (
    <main className="sa-page-container space-y-5">
      <Link to={`${basePath}/orders`} className="back-link"><ChevronLeft className="size-5" />Buyurtmalarga qaytish</Link>
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="sa-eyebrow">Buyurtma tafsilotlari</p><h1 className="sa-page-title">#{item.id}</h1></div><span className={`order-status ${getOrderStatusClass(item.status)}`}>{orderStatusLabels[item.status]}</span></header>
      <GlassCard className="sa-glass space-y-3 rounded-3xl p-5">
        <h2 className="text-lg font-black text-slate-950">Mijoz</h2>
        <p className="text-sm"><strong>Ism:</strong> {`${item.customer.firstName} ${item.customer.lastName ?? ''}`.trim()}</p>
        <p className="text-sm"><strong>Telefon:</strong> {item.phone ?? '—'}</p>
        <p className="text-sm"><strong>Manzil:</strong> {item.deliveryAddress ?? '—'}</p>
        {item.btcPostBranchNumber ? <p className="text-sm"><strong>BTC pochta filiali:</strong> {item.btcPostBranchNumber}</p> : null}
        <p className="text-sm"><strong>Izoh:</strong> {item.note ?? '—'}</p>
        {item.cancelReason ? <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700"><strong>Bekor qilish sababi:</strong> {item.cancelReason}</p> : null}
        {item.latitude ? <p className="text-sm"><strong>Koordinata:</strong> {item.latitude}, {item.longitude}</p> : null}
      </GlassCard>
      <GlassCard className="sa-glass space-y-3 rounded-3xl p-5">
        <h2 className="text-lg font-black text-slate-950">Mahsulotlar</h2>
        {item.items.map((line) => <div key={line.id} className="flex justify-between gap-3 border-t border-slate-200/70 pt-3 text-sm"><span>{line.productName} × {line.quantity}<small className="mt-1 block text-slate-500">Bir dona: {formatMoney(line.unitPrice)}</small></span><strong>{formatMoney(line.lineTotal)}</strong></div>)}
        <div className="border-t border-slate-200/70 pt-3 text-right font-black">Jami: {formatMoney(item.total)}</div>
      </GlassCard>
      <GlassCard className="sa-glass rounded-3xl p-5">
        <p className="text-sm"><strong>Yaratilgan:</strong> {formatDateTime(item.createdAt)}</p>
        <p className="mt-2 text-sm"><strong>Tasdiqlash muddati:</strong> {formatDateTime(item.confirmationDeadline)}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {item.status === 'PENDING_CONFIRMATION' ? <Button type="button" disabled={confirm.isPending} onClick={() => void runAction(() => confirm.mutateAsync(id), 'Buyurtma tasdiqlandi')}>{confirm.isPending ? <Loader2 className="size-4 animate-spin" /> : null}Tasdiqlash</Button> : null}
          {item.status === 'PENDING_CONFIRMATION' ? <Button type="button" variant="outline" disabled={reject.isPending} onClick={() => setShowReject((current) => !current)}>Rad etish</Button> : null}
          {nextStatuses.map((status) => <Button key={status} type="button" variant="outline" disabled={updateStatus.isPending} onClick={() => changeStatus(status)}>{pendingStatus === status && updateStatus.isPending ? <Loader2 className="size-4 animate-spin" /> : null}{orderStatusLabels[status]}</Button>)}
        </div>
        {showReject ? <div className="mt-4 space-y-3 rounded-2xl border border-red-200 bg-red-50/70 p-4"><label className="block text-sm font-bold text-red-800">Rad etish sababi (ixtiyoriy)<textarea className="sa-input mt-2 min-h-24" maxLength={500} value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="Mijozga ko‘rinadigan sabab" /></label><div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={reject.isPending} onClick={() => setShowReject(false)}>Yopish</Button><Button type="button" disabled={reject.isPending} onClick={() => void rejectOrder()}>{reject.isPending ? <Loader2 className="size-4 animate-spin" /> : null}Rad etishni tasdiqlash</Button></div></div> : null}
      </GlassCard>
    </main>
  )
}
