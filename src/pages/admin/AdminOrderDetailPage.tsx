import { useState } from 'react'
import { ChevronLeft, ExternalLink, Loader2, MapPin, Phone } from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import type { OrderStatus } from '@/features/orders/api/orders.api'
import { useManageOrder, useOrderAdminMutations } from '@/features/orders/hooks/use-orders'
import { getNextAdminStatuses, getOrderStatusClass, orderStatusLabels } from '@/features/orders/lib/order-status'
import { ConfirmDialog } from '@/features/super-admin/components/ConfirmDialog'
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
  const [cancelStatusToConfirm, setCancelStatusToConfirm] = useState<OrderStatus | null>(null)

  if (order.isLoading) {
    return (
      <main className="sa-page-container space-y-4" aria-label="Buyurtma yuklanmoqda">
        {[1, 2, 3].map((item) => (
          <div key={item} className="sa-glass animate-pulse space-y-3 rounded-3xl p-5">
            <div className="h-6 w-2/5 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        ))}
      </main>
    )
  }

  if (order.isError || !order.data) {
    return (
      <main className="sa-page-container space-y-4">
        <p className="font-bold text-red-600">Buyurtma topilmadi yoki yuklab bo‘lmadi.</p>
        <Link to={`${basePath}/orders`} className="back-link">
          <ChevronLeft className="size-5" /> Buyurtmalarga qaytish
        </Link>
      </main>
    )
  }

  const item = order.data
  const nextStatuses = getNextAdminStatuses(item.status)

  async function runAction(action: () => Promise<unknown>, success: string) {
    try {
      await action()
      showToast(success)
    } catch (error) {
      showToast(normalizeApiError(error).message, 'error')
    } finally {
      setPendingStatus(null)
    }
  }

  function handleStatusClick(status: OrderStatus) {
    if (status === 'CANCELLED') {
      setCancelStatusToConfirm(status)
      return
    }
    setPendingStatus(status)
    void runAction(() => updateStatus.mutateAsync({ id, status }), `${orderStatusLabels[status]} holatiga o‘tkazildi`)
  }

  function handleConfirmCancelStatus() {
    if (!cancelStatusToConfirm) return
    const status = cancelStatusToConfirm
    setCancelStatusToConfirm(null)
    setPendingStatus(status)
    void runAction(() => updateStatus.mutateAsync({ id, status }), `${orderStatusLabels[status]} holatiga o‘tkazildi`)
  }

  async function rejectOrder() {
    const reason = rejectReason.trim()
    setPendingStatus('CANCELLED')
    try {
      await reject.mutateAsync({ id, ...(reason ? { reason } : {}) })
      showToast('Buyurtma rad etildi')
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
      <Link to={`${basePath}/orders`} className="back-link">
        <ChevronLeft className="size-5" /> Buyurtmalarga qaytish
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="sa-eyebrow">Buyurtma tafsilotlari</p>
          <h1 className="sa-page-title">#{item.id}</h1>
        </div>
        <span className={`order-status ${getOrderStatusClass(item.status)}`}>
          {orderStatusLabels[item.status]}
        </span>
      </header>

      {/* Mijoz ma'lumotlari */}
      <GlassCard className="sa-glass space-y-3 rounded-3xl p-5">
        <h2 className="text-lg font-black text-slate-950 dark:text-slate-100">Mijoz</h2>
        <p className="text-sm">
          <strong>Ism:</strong> {`${item.customer.firstName} ${item.customer.lastName ?? ''}`.trim()}
        </p>
        <p className="text-sm flex items-center gap-1.5">
          <strong>Telefon:</strong>{' '}
          {item.phone ? (
            <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1 font-bold text-indigo-600 underline dark:text-indigo-400">
              <Phone className="size-3.5" /> {item.phone}
            </a>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </p>
        <p className="text-sm">
          <strong>Manzil:</strong> {item.deliveryAddress ?? '—'}
        </p>
        {item.btcPostBranchNumber ? (
          <p className="text-sm">
            <strong>BTC pochta filiali:</strong> #{item.btcPostBranchNumber}
          </p>
        ) : null}
        <p className="text-sm">
          <strong>Izoh:</strong> {item.note ?? '—'}
        </p>
        {item.cancelReason ? (
          <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
            <strong>Bekor qilish sababi:</strong> {item.cancelReason}
          </p>
        ) : null}
        {item.latitude && item.longitude ? (
          <p className="text-sm">
            <strong>Koordinata:</strong>{' '}
            <a
              href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-indigo-600 underline dark:text-indigo-400"
            >
              <MapPin className="size-3.5" /> {item.latitude}, {item.longitude}
              <ExternalLink className="size-3" />
            </a>
          </p>
        ) : null}
      </GlassCard>

      {/* Mahsulotlar */}
      <GlassCard className="sa-glass space-y-3 rounded-3xl p-5">
        <h2 className="text-lg font-black text-slate-950 dark:text-slate-100">Mahsulotlar</h2>
        {item.items.map((line) => (
          <div key={line.id} className="flex justify-between gap-3 border-t border-slate-200/70 pt-3 text-sm dark:border-slate-800">
            <span>
              <span className="font-bold">{line.productName}</span> × {line.quantity}
              <small className="mt-1 block text-slate-500 dark:text-slate-400">Bir dona: {formatMoney(line.unitPrice)}</small>
            </span>
            <strong className="font-black">{formatMoney(line.lineTotal)}</strong>
          </div>
        ))}
        <div className="border-t border-slate-200/70 pt-3 text-right font-black text-base dark:border-slate-800">
          Jami: {formatMoney(item.total)}
        </div>
      </GlassCard>

      {/* Vaqt va Amallar */}
      <GlassCard className="sa-glass rounded-3xl p-5">
        <p className="text-sm">
          <strong>Yaratilgan:</strong> {formatDateTime(item.createdAt)}
        </p>
        <p className="mt-2 text-sm">
          <strong>Tasdiqlash muddati:</strong> {formatDateTime(item.confirmationDeadline)}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {item.status === 'PENDING_CONFIRMATION' ? (
            <Button
              type="button"
              disabled={confirm.isPending}
              onClick={() => void runAction(() => confirm.mutateAsync(id), 'Buyurtma tasdiqlandi')}
            >
              {confirm.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Tasdiqlash
            </Button>
          ) : null}
          {item.status === 'PENDING_CONFIRMATION' ? (
            <Button
              type="button"
              variant="outline"
              disabled={reject.isPending}
              onClick={() => setShowReject((current) => !current)}
            >
              Rad etish
            </Button>
          ) : null}
          {nextStatuses.map((status) => (
            <Button
              key={status}
              type="button"
              variant="outline"
              disabled={updateStatus.isPending}
              onClick={() => handleStatusClick(status)}
            >
              {pendingStatus === status && updateStatus.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {orderStatusLabels[status]}
            </Button>
          ))}
        </div>
        {showReject ? (
          <div className="mt-4 space-y-3 rounded-2xl border border-red-200 bg-red-50/70 p-4 dark:border-red-900/40 dark:bg-red-950/40">
            <label className="block text-sm font-bold text-red-800 dark:text-red-300">
              Rad etish sababi (ixtiyoriy)
              <textarea
                className="sa-input mt-2 min-h-24"
                maxLength={500}
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Mijozga ko‘rinadigan sabab"
              />
            </label>
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" disabled={reject.isPending} onClick={() => setShowReject(false)}>
                Yopish
              </Button>
              <Button type="button" disabled={reject.isPending} onClick={() => void rejectOrder()} className="bg-red-600 hover:bg-red-700">
                {reject.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Rad etishni tasdiqlash
              </Button>
            </div>
          </div>
        ) : null}
      </GlassCard>

      <ConfirmDialog
        open={cancelStatusToConfirm !== null}
        title="Buyurtmani bekor qilish"
        description="Buyurtmani bekor qilmoqchimisiz?"
        confirmLabel="Bekor qilish"
        pending={updateStatus.isPending}
        danger
        onConfirm={handleConfirmCancelStatus}
        onOpenChange={(open) => {
          if (!open) setCancelStatusToConfirm(null)
        }}
      />
    </main>
  )
}
