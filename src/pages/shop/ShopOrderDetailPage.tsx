import { useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Loader2,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  RotateCcw,
  Truck,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useCancelOrder, useMyOrder } from '@/features/orders/hooks/use-orders'
import { ConfirmationDeadline } from '@/features/orders/components/ConfirmationDeadline'
import { OrderStatusCard } from '@/features/orders/components/OrderStatusCard'
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
          <section className="glass-card overflow-hidden rounded-3xl p-5 sm:p-6 transition-all space-y-4">
            <div className="flex items-center gap-3 border-b border-[var(--app-border)] pb-3.5">
              <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white shadow-md shadow-pink-500/20">
                <Truck className="size-5" />
              </span>
              <div>
                <h2 className="text-base font-black tracking-tight sm:text-lg">Yetkazib berish</h2>
                <p className="shop-muted text-xs">Buyurtma yuboriladigan manzil va bog‘lanish</p>
              </div>
            </div>

            <div className="space-y-3 pt-1 text-sm">
              {/* Telefon */}
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--app-border)] bg-white/40 p-3.5 dark:bg-slate-900/40">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-pink-100/80 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300">
                    <Phone className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Telefon raqam</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {order.data.phone ?? 'Ko‘rsatilmagan'}
                    </p>
                  </div>
                </div>
                {order.data.phone ? (
                  <a
                    href={`tel:${order.data.phone}`}
                    className="shrink-0 rounded-xl bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-700 transition hover:bg-pink-100 dark:bg-pink-950/60 dark:text-pink-300 dark:hover:bg-pink-900/60"
                  >
                    Qo‘ng‘iroq
                  </a>
                ) : null}
              </div>

              {/* Manzil */}
              <div className="flex items-start gap-3 rounded-2xl border border-[var(--app-border)] bg-white/40 p-3.5 dark:bg-slate-900/40">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  <MapPin className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Yetkazib berish manzili</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {order.data.deliveryAddress ?? 'Ko‘rsatilmagan'}
                  </p>
                </div>
              </div>

              {/* BTC Pochta Filiali */}
              {order.data.btcPostBranchNumber ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-pink-200/60 bg-gradient-to-r from-pink-50/70 via-rose-50/40 to-pink-50/70 p-3.5 dark:border-pink-900/40 dark:from-pink-950/30 dark:via-rose-950/20 dark:to-pink-950/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-pink-200 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                      <Building2 className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">BTC Pochta</p>
                      <p className="font-extrabold text-slate-900 dark:text-slate-100">
                        Filial #{order.data.btcPostBranchNumber}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-pink-600/10 px-2.5 py-1 text-[11px] font-black text-pink-700 dark:bg-pink-400/10 dark:text-pink-300">
                    Filial
                  </span>
                </div>
              ) : null}

              {/* Izoh */}
              {order.data.note ? (
                <div className="flex items-start gap-3 rounded-2xl border border-dashed border-[var(--app-border)] bg-slate-50/50 p-3.5 dark:bg-slate-900/30">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <MessageSquare className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Mijoz izohi</p>
                    <p className="text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed">
                      {order.data.note}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Bekor qilish sababi */}
              {order.data.cancelReason ? (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  <AlertCircle className="size-5 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-bold">Buyurtma bekor qilingan</p>
                    <p className="text-xs font-normal opacity-90 mt-0.5">{order.data.cancelReason}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

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
