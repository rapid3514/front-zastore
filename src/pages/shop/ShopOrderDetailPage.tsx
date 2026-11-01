import { useState } from 'react'
import { ArrowLeft, Loader2, MapPin, Package, Phone, RotateCcw } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useCancelOrder, useMyOrder } from '@/features/orders/hooks/use-orders'
import { ConfirmationDeadline } from '@/features/orders/components/ConfirmationDeadline'
import { OrderStatusCard } from '@/features/orders/components/OrderStatusCard'
import { OrderPaymentCard } from '@/features/payments/components/OrderPaymentCard'
import { ConfirmDialog } from '@/features/super-admin/components/ConfirmDialog'
import { normalizeApiError } from '@/shared/api/api-error'
import { formatMoney } from '@/shared/lib/format'
import { telegramHaptic } from '@/shared/telegram/telegram'
import { useToastStore } from '@/shared/ui/toast-store'

function OrderDetailSkeleton() {
  return (
    <div className="space-y-4" aria-label="Buyurtma yuklanmoqda">
      {[1, 2, 3].map((item) => (
        <div key={item} className="glass-card animate-pulse space-y-3 rounded-3xl p-5">
          <div className="h-5 w-2/5 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  )
}

export function ShopOrderDetailPage() {
  const { id = '' } = useParams()
  const order = useMyOrder(id)
  const cancel = useCancelOrder()
  const showToast = useToastStore((state) => state.show)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  async function handleConfirmCancel() {
    try {
      await cancel.mutateAsync({ id })
      telegramHaptic('warning')
      showToast('Buyurtma bekor qilindi')
      setShowCancelDialog(false)
    } catch (error) {
      showToast(normalizeApiError(error).message, 'error')
    }
  }

  return (
    <main className="page-container shop-page space-y-5">
      <Link to="/orders" className="shop-back">
        <ArrowLeft size={17} /> Buyurtmalarga qaytish
      </Link>

      {order.isLoading ? <OrderDetailSkeleton /> : null}

      {order.isError ? (
        <div className="glass-card p-8 text-center">
          <p className="font-semibold text-red-600">Buyurtmani yuklab bo‘lmadi.</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => void order.refetch()}>
            <RotateCcw className="size-4" /> Qayta urinish
          </Button>
        </div>
      ) : null}

      {order.data ? (
        <>
          {/* Top Order Status Timeline Card matching template */}
          <OrderStatusCard order={order.data} />

          {/* Mahsulotlar tafsiloti */}
          <section className="glass-card space-y-3 rounded-3xl p-5">
            <h2 className="text-base font-black sm:text-lg">Buyurtma tarkibi</h2>
            {order.data.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 border-t border-[var(--app-border)] pt-3 text-sm">
                <span className="min-w-0">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{item.productName}</span> × {item.quantity}
                  <small className="shop-muted mt-1 block">Bir dona: {formatMoney(item.unitPrice)}</small>
                </span>
                <strong className="shrink-0 font-black">{formatMoney(item.lineTotal)}</strong>
              </div>
            ))}
            <div className="flex justify-between border-t border-[var(--app-border)] pt-4 text-base font-black sm:text-lg">
              <span>Jami:</span>
              <strong className="text-[var(--shop-accent-strong)]">{formatMoney(order.data.total)}</strong>
            </div>
            <ConfirmationDeadline value={order.data.confirmationDeadline} status={order.data.status} />
          </section>

          {/* Yetkazib berish ma'lumotlari */}
          <section className="glass-card space-y-3 rounded-3xl p-5">
            <h2 className="text-base font-black sm:text-lg">Yetkazib berish</h2>
            {order.data.phone ? (
              <p className="flex items-start gap-2 text-sm">
                <Phone className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <a href={`tel:${order.data.phone}`} className="font-semibold text-indigo-600 underline dark:text-indigo-400">
                  {order.data.phone}
                </a>
              </p>
            ) : (
              <p className="flex items-start gap-2 text-sm text-slate-500">
                <Phone className="mt-0.5 size-4 shrink-0" /> Telefon ko‘rsatilmagan
              </p>
            )}
            <p className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
              <span>{order.data.deliveryAddress ?? 'Manzil ko‘rsatilmagan'}</span>
            </p>
            {order.data.btcPostBranchNumber ? (
              <p className="flex items-start gap-2 text-sm font-medium">
                <span className="inline-block rounded-md bg-pink-100 px-1.5 py-0.5 text-xs font-bold text-pink-700 dark:bg-pink-900/50 dark:text-pink-300">
                  BTC Pochta:
                </span>
                Filial #{order.data.btcPostBranchNumber}
              </p>
            ) : null}
            {order.data.note ? (
              <p className="shop-muted text-sm italic">Izoh: {order.data.note}</p>
            ) : null}
            {order.data.cancelReason ? (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                Bekor qilish sababi: {order.data.cancelReason}
              </p>
            ) : null}
          </section>

          <OrderPaymentCard orderId={order.data.id} />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="shop-muted flex items-center gap-1.5 text-xs font-mono">
              <Package className="size-4" /> ID: {order.data.id}
            </span>
            {order.data.status === 'PENDING_CONFIRMATION' ? (
              <Button
                type="button"
                variant="outline"
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                disabled={cancel.isPending}
                onClick={() => setShowCancelDialog(true)}
              >
                {cancel.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Buyurtmani bekor qilish
              </Button>
            ) : null}
          </div>

          <ConfirmDialog
            open={showCancelDialog}
            title="Buyurtmani bekor qilish"
            description="Buyurtmangizni bekor qilmoqchimisiz?"
            confirmLabel="Bekor qilish"
            pending={cancel.isPending}
            danger
            onConfirm={handleConfirmCancel}
            onOpenChange={setShowCancelDialog}
          />
        </>
      ) : null}
    </main>
  )
}
