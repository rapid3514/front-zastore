import { useState } from 'react'
import { Package, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type OrderStatus } from '@/features/orders/api/orders.api'
import { useCancelOrder, useMyOrders } from '@/features/orders/hooks/use-orders'
import { OrderStatusCard } from '@/features/orders/components/OrderStatusCard'
import { ConfirmDialog } from '@/features/super-admin/components/ConfirmDialog'
import { normalizeApiError } from '@/shared/api/api-error'
import { telegramHaptic } from '@/shared/telegram/telegram'
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
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const orders = useMyOrders({ page, limit: 20, ...(status ? { status } : {}) })
  const cancel = useCancelOrder()
  const showToast = useToastStore((state) => state.show)

  async function handleConfirmCancel() {
    if (!cancelingId) return
    try {
      await cancel.mutateAsync({ id: cancelingId })
      telegramHaptic('warning')
      showToast('Buyurtma bekor qilindi')
      setCancelingId(null)
    } catch (error) {
      showToast(normalizeApiError(error).message, 'error')
    }
  }

  return (
    <main className="page-container shop-page space-y-5">
      <header>
        <h1 className="shop-page-title">Mening buyurtmalarim</h1>
      </header>

      <div className="shop-chips hide-scrollbar" role="tablist" aria-label="Buyurtma holatlari">
        {filters.map((filter) => (
          <button
            key={filter.label}
            type="button"
            role="tab"
            aria-selected={status === filter.value}
            className={`shop-chip ${status === filter.value ? 'shop-chip-active' : ''}`}
            onClick={() => {
              setStatus(filter.value)
              setPage(1)
              telegramHaptic('light')
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {orders.isLoading ? (
        <div className="space-y-4" aria-label="Buyurtmalar yuklanmoqda">
          {[1, 2, 3].map((item) => (
            <div key={item} className="glass-card animate-pulse space-y-3 rounded-3xl p-5">
              <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : null}

      {orders.isError ? (
        <div className="glass-card p-8 text-center">
          <p className="text-sm font-semibold text-red-600">Buyurtmalarni yuklab bo‘lmadi.</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => void orders.refetch()}>
            <RotateCcw className="size-4" /> Qayta urinish
          </Button>
        </div>
      ) : null}

      {orders.data?.data.length === 0 ? (
        <div className="glass-card mx-auto max-w-xl px-6 py-14 text-center">
          <div className="shop-empty-icon"><Package size={30} /></div>
          <h2 className="mt-5 text-xl font-bold">Hozircha buyurtmalar yo‘q</h2>
          <p className="shop-muted mx-auto mt-2 max-w-sm text-sm leading-6">
            Savatdan buyurtma berganingizdan keyin uning holati shu yerda ko‘rinadi.
          </p>
        </div>
      ) : null}

      <div className="space-y-4">
        {orders.data?.data.map((order) => (
          <OrderStatusCard
            key={order.id}
            order={order}
            detailHref={`/orders/${order.id}`}
          />
        ))}
      </div>

      {orders.data && orders.data.meta && orders.data.meta.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3 pt-3">
          <Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Oldingi
          </Button>
          <span className="text-sm font-bold">{page} / {orders.data.meta.totalPages}</span>
          <Button type="button" variant="outline" disabled={page >= orders.data.meta.totalPages} onClick={() => setPage(page + 1)}>
            Keyingi
          </Button>
        </div>
      ) : null}

      <ConfirmDialog
        open={cancelingId !== null}
        title="Buyurtmani bekor qilish"
        description="Haqiqatan ham bu buyurtmani bekor qilmoqchimisiz?"
        confirmLabel="Bekor qilish"
        pending={cancel.isPending}
        danger
        onConfirm={handleConfirmCancel}
        onOpenChange={(open) => {
          if (!open) setCancelingId(null)
        }}
      />
    </main>
  )
}
