import { useState } from 'react'
import { Loader2, Package, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type OrderStatus } from '@/features/orders/api/orders.api'
import { useCancelOrder, useMyOrders } from '@/features/orders/hooks/use-orders'
import { getOrderStatusClass, orderStatusLabels } from '@/features/orders/lib/order-status'
import { normalizeApiError } from '@/shared/api/api-error'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import { useToastStore } from '@/shared/ui/toast-store'

const filters: Array<{ label: string; value?: OrderStatus }> = [
  { label: 'Barchasi' },
  { label: 'Kutilmoqda', value: 'PENDING_CONFIRMATION' },
  { label: 'Tasdiqlandi', value: 'CONFIRMED' },
  { label: 'Jarayonda', value: 'PROCESSING' },
  { label: 'Yakunlandi', value: 'COMPLETED' },
  { label: 'Bekor qilindi', value: 'CANCELLED' },
]

export function ShopOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | undefined>()
  const [page, setPage] = useState(1)
  const orders = useMyOrders({ page, limit: 20, ...(status ? { status } : {}) })
  const cancel = useCancelOrder()
  const showToast = useToastStore((state) => state.show)

  async function cancelOrder(id: string) {
    if (!window.confirm('Buyurtmani bekor qilmoqchimisiz?')) return
    try {
      await cancel.mutateAsync({ id })
      showToast('Buyurtma bekor qilindi')
    } catch (error) {
      showToast(normalizeApiError(error).message, 'error')
    }
  }

  return (
    <main className="page-container shop-page space-y-5">
      <header><h1 className="shop-page-title">Mening buyurtmalarim</h1></header>
      <div className="shop-chips hide-scrollbar" role="tablist" aria-label="Buyurtma holatlari">
        {filters.map((filter) => <button key={filter.label} type="button" role="tab" aria-selected={status === filter.value} className={`shop-chip ${status === filter.value ? 'shop-chip-active' : ''}`} onClick={() => { setStatus(filter.value); setPage(1) }}>{filter.label}</button>)}
      </div>

      {orders.isLoading ? <div className="glass-card p-8 text-center"><Loader2 className="mx-auto size-6 animate-spin" /><p className="shop-muted mt-3 text-sm">Buyurtmalar yuklanmoqda...</p></div> : null}
      {orders.isError ? <div className="glass-card p-8 text-center"><p className="text-sm font-semibold text-red-600">Buyurtmalarni yuklab bo‘lmadi.</p><Button type="button" variant="outline" className="mt-4" onClick={() => void orders.refetch()}><RotateCcw className="size-4" /> Qayta urinish</Button></div> : null}
      {orders.data?.data.length === 0 ? <div className="glass-card mx-auto max-w-xl px-6 py-14 text-center"><div className="shop-empty-icon"><Package size={30} /></div><h2 className="mt-5 text-xl font-bold">Hozircha buyurtmalar yo‘q</h2><p className="shop-muted mx-auto mt-2 max-w-sm text-sm leading-6">Savatdan buyurtma berganingizdan keyin uning holati shu yerda ko‘rinadi.</p></div> : null}

      <div className="space-y-4">
        {orders.data?.data.map((order) => (
          <article key={order.id} className="shop-order-card glass-card space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="shop-order-icon"><Package size={19} /></span><div><p className="font-black">#{order.id.slice(0, 8)}</p><p className="shop-muted mt-1 text-xs">{formatDateTime(order.createdAt)}</p></div></div><span className={`order-status ${getOrderStatusClass(order.status)}`}>{orderStatusLabels[order.status]}</span></div>
            <div className="space-y-2 border-y border-[var(--app-border)] py-3">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span className="min-w-0 truncate">{item.productName} × {item.quantity}</span><strong className="shrink-0">{formatMoney(item.lineTotal)}</strong></div>)}</div>
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="shop-muted text-xs">Jami</p><p className="text-lg font-black">{formatMoney(order.total)}</p>{order.deliveryAddress ? <p className="shop-muted mt-1 text-xs">{order.deliveryAddress}</p> : null}</div>{order.status === 'PENDING_CONFIRMATION' ? <Button type="button" variant="outline" disabled={cancel.isPending} onClick={() => void cancelOrder(order.id)}>{cancel.isPending ? <Loader2 className="size-4 animate-spin" /> : null}Bekor qilish</Button> : null}</div>
          </article>
        ))}
      </div>

      {orders.data && orders.data.meta && orders.data.meta.totalPages > 1 ? <div className="flex items-center justify-center gap-3"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Oldingi</Button><span className="text-sm font-bold">{page} / {orders.data.meta.totalPages}</span><Button type="button" variant="outline" disabled={page >= orders.data.meta.totalPages} onClick={() => setPage(page + 1)}>Keyingi</Button></div> : null}
    </main>
  )
}
