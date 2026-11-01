import { useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ImageOff,
  Loader2,
  MapPin,
  MessageCircle,
  MessageSquare,
  Package,
  Phone,
  UserRound,
  XCircle,
} from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { ordersApi, type OrderStatus } from '@/features/orders/api/orders.api'
import { useManageOrder, useOrderAdminMutations } from '@/features/orders/hooks/use-orders'
import { getNextAdminStatuses, getOrderStatusClass, orderStatusLabels } from '@/features/orders/lib/order-status'
import { ConfirmDialog } from '@/features/super-admin/components/ConfirmDialog'
import { normalizeApiError } from '@/shared/api/api-error'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import { openTelegramChat, telegramHaptic } from '@/shared/telegram/telegram'
import { useToastStore } from '@/shared/ui/toast-store'

function getAdminProgressStep(status: OrderStatus) {
  switch (status) {
    case 'PENDING_CONFIRMATION':
      return { step: 1, width: '33%', barClass: 'bg-pink-500' }
    case 'CONFIRMED':
      return { step: 2, width: '55%', barClass: 'bg-indigo-500' }
    case 'PROCESSING':
      return { step: 2, width: '75%', barClass: 'bg-amber-500' }
    case 'COMPLETED':
      return { step: 3, width: '100%', barClass: 'bg-emerald-500' }
    default:
      return null
  }
}

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
        <Link to={`${basePath}/orders`} className="shop-back">
          <ArrowLeft className="size-4" /> Buyurtmalarga qaytish
        </Link>
        <div className="sa-glass rounded-3xl p-7 text-center">
          <p className="font-bold text-red-600">Buyurtma topilmadi yoki yuklab bo‘lmadi.</p>
        </div>
      </main>
    )
  }

  const item = order.data
  const nextStatuses = getNextAdminStatuses(item.status)
  const shortOrderId = item.id.slice(0, 8).toUpperCase()
  const customerFullName = `${item.customer.firstName} ${item.customer.lastName ?? ''}`.trim() || 'Mijoz'
  const customerInitial = customerFullName.charAt(0).toLocaleUpperCase('uz')
  const phoneToUse = item.phone ?? item.customer.phone ?? null
  const canOpenChat = Boolean(
    item.customer.username?.trim() ||
    item.customer.phone?.trim() ||
    item.phone?.trim() ||
    item.customer.telegramId,
  )
  const progress = getAdminProgressStep(item.status)

  function handleOpenCustomerChat() {
    telegramHaptic('light')
    const openedVia = openTelegramChat({
      username: item.customer.username,
      telegramPhone: item.customer.phone,
      orderPhone: item.phone,
      telegramId: item.customer.telegramId,
    })

    if (!item.customer.username) {
      void ordersApi
        .openCustomerChat(item.id)
        .then((res) => {
          if (res?.username && openedVia !== 'username') {
            openTelegramChat({ username: res.username })
          }
        })
        .catch(() => {
          // Non-blocking fallback
        })
    }
  }

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
      {/* Orqaga qaytish */}
      <Link to={`${basePath}/orders`} className="shop-back">
        <ArrowLeft className="size-4" /> Buyurtmalarga qaytish
      </Link>

      {/* Buyurtma Sarlavha va Status Kartasi */}
      <GlassCard className="sa-glass relative overflow-hidden rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="sa-eyebrow">Buyurtma tafsilotlari</p>
            <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 dark:text-slate-100 sm:text-2xl">
              BUYURTMA-#{shortOrderId}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-400 break-all">
              <Package className="size-3.5 shrink-0" />
              {item.id}
            </p>
          </div>
          <span className={`order-status ${getOrderStatusClass(item.status)}`}>
            {orderStatusLabels[item.status]}
          </span>
        </div>

        {progress ? (
          <div className="mt-5 space-y-2 border-t border-pink-200/50 pt-4 dark:border-pink-900/30">
            <div className="grid grid-cols-3 text-center text-[0.72rem] font-bold text-slate-500 dark:text-slate-400 sm:text-xs">
              <span className={`text-left ${progress.step >= 1 ? 'font-black text-pink-600 dark:text-pink-400' : ''}`}>
                Qabul qilindi
              </span>
              <span className={progress.step >= 2 ? 'font-black text-pink-600 dark:text-pink-400' : ''}>
                Tayyorlanmoqda
              </span>
              <span className={`text-right ${progress.step >= 3 ? 'font-black text-pink-600 dark:text-pink-400' : ''}`}>
                Yetkazilmoqda
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-pink-100 dark:bg-pink-950/60">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progress.barClass}`}
                style={{ width: progress.width }}
              />
            </div>
          </div>
        ) : null}
      </GlassCard>

      {/* Mijoz va Yetkazib berish ma'lumotlari */}
      <GlassCard className="sa-glass space-y-4 rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-pink-200/50 pb-4 dark:border-pink-900/30">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-base font-black text-white shadow-md shadow-pink-500/20">
              {customerInitial}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                Mijoz ma’lumotlari
              </p>
              <h2 className="truncate text-base font-black text-slate-950 dark:text-slate-100 sm:text-lg">
                {customerFullName}
              </h2>
              {item.customer.username ? (
                <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                  @{item.customer.username.replace(/^@/, '')}
                </p>
              ) : null}
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-pink-100/70 px-3 py-1.5 text-xs font-bold text-pink-700 dark:bg-pink-950/50 dark:text-pink-300">
            <UserRound className="size-3.5" /> Mijoz
          </span>
        </div>

        <div className="space-y-3 text-sm">
          {/* Telefon raqam (Admin uchun bosilganda qo'ng'iroq qiladi) + Chat orqali muloqot tugmasi */}
          <div className="space-y-2.5 rounded-2xl border border-pink-200/60 bg-white/55 p-3.5 dark:border-pink-900/30 dark:bg-slate-900/40">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-pink-100 text-pink-700 dark:bg-pink-950/70 dark:text-pink-300">
                  <Phone className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Telefon raqam</p>
                  {phoneToUse ? (
                    <a
                      href={`tel:${phoneToUse}`}
                      className="block truncate font-extrabold text-pink-700 underline decoration-pink-400/60 underline-offset-2 transition hover:text-pink-800 dark:text-pink-300"
                    >
                      {phoneToUse}
                    </a>
                  ) : (
                    <p className="font-bold text-slate-400">Ko‘rsatilmagan</p>
                  )}
                </div>
              </div>

              {phoneToUse ? (
                <a
                  href={`tel:${phoneToUse}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm shadow-pink-500/20 transition hover:opacity-95 no-underline"
                >
                  <Phone className="size-3.5" />
                  Qo‘ng‘iroq
                </a>
              ) : null}
            </div>

            {/* Telefon raqam pastida: Chat orqali muloqot tugmasi */}
            {canOpenChat ? (
              <button
                type="button"
                onClick={handleOpenCustomerChat}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-200/80 bg-pink-50/80 px-4 py-2.5 text-xs font-extrabold text-pink-700 transition hover:bg-pink-100/90 dark:border-pink-800/50 dark:bg-pink-950/50 dark:text-pink-200 dark:hover:bg-pink-900/60"
              >
                <MessageCircle className="size-4" />
                Chat orqali muloqot
              </button>
            ) : null}
          </div>

          {/* Manzil */}
          <div className="flex items-start gap-3 rounded-2xl border border-pink-200/60 bg-white/55 p-3.5 dark:border-pink-900/30 dark:bg-slate-900/40">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <MapPin className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Yetkazib berish manzili</p>
              <p className="font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {item.deliveryAddress ?? 'Ko‘rsatilmagan'}
              </p>
              {item.latitude && item.longitude ? (
                <a
                  href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 underline dark:text-indigo-400"
                >
                  Xaritada ko‘rish ({item.latitude}, {item.longitude})
                  <ExternalLink className="size-3" />
                </a>
              ) : null}
            </div>
          </div>

          {/* BTC Pochta Filiali */}
          {item.btcPostBranchNumber ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-pink-200/70 bg-gradient-to-r from-pink-50/80 via-rose-50/50 to-pink-50/80 p-3.5 dark:border-pink-900/40 dark:from-pink-950/30 dark:via-rose-950/20 dark:to-pink-950/30">
              <div className="flex items-center gap-3 min-w-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-pink-200 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                  <Building2 className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                    BTC Pochta filiali
                  </p>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100">
                    Filial #{item.btcPostBranchNumber}
                  </p>
                </div>
              </div>
              <span className="rounded-lg bg-pink-600/10 px-2.5 py-1 text-[11px] font-black text-pink-700 dark:bg-pink-400/10 dark:text-pink-300">
                BTC
              </span>
            </div>
          ) : null}

          {/* Izoh */}
          <div className="flex items-start gap-3 rounded-2xl border border-dashed border-pink-200/70 bg-white/40 p-3.5 dark:border-pink-900/30 dark:bg-slate-900/30">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <MessageSquare className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Mijoz izohi</p>
              <p className="text-xs italic text-slate-700 dark:text-slate-300 leading-relaxed">
                {item.note || 'Izoh qoldirilmagan'}
              </p>
            </div>
          </div>

          {/* Bekor qilish sababi */}
          {item.cancelReason ? (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="size-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-bold">Bekor qilish sababi</p>
                <p className="text-xs font-normal opacity-90 mt-0.5">{item.cancelReason}</p>
              </div>
            </div>
          ) : null}
        </div>
      </GlassCard>

      {/* Mahsulotlar ro'yxati */}
      <GlassCard className="sa-glass space-y-3.5 rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between border-b border-pink-200/50 pb-3 dark:border-pink-900/30">
          <h2 className="text-base font-black text-slate-950 dark:text-slate-100 sm:text-lg">Mahsulotlar</h2>
          <span className="rounded-full bg-pink-100/80 px-2.5 py-0.5 text-xs font-extrabold text-pink-700 dark:bg-pink-950/60 dark:text-pink-300">
            {item.items.length} ta pozitsiya
          </span>
        </div>

        <div className="space-y-3">
          {item.items.map((line) => (
            <div
              key={line.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-pink-200/50 bg-white/50 p-3 dark:border-pink-900/30 dark:bg-slate-900/40"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-pink-200/60 bg-rose-50 dark:border-pink-900/40">
                  {line.imageUrl ? (
                    <img src={line.imageUrl} alt={line.productName} loading="lazy" className="size-full object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center text-rose-400">
                      <ImageOff className="size-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
                    {line.productName}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {formatMoney(line.unitPrice)} × <span className="font-black text-pink-600 dark:text-pink-400">{line.quantity} dona</span>
                  </p>
                </div>
              </div>
              <strong className="shrink-0 text-sm font-black text-slate-950 dark:text-slate-100 sm:text-base">
                {formatMoney(line.lineTotal)}
              </strong>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-pink-200/50 pt-4 text-base font-black dark:border-pink-900/30 sm:text-lg">
          <span>Jami to‘lov:</span>
          <strong className="text-lg text-pink-700 dark:text-pink-300 sm:text-xl">{formatMoney(item.total)}</strong>
        </div>
      </GlassCard>

      {/* Vaqt va Buyurtmani boshqarish */}
      <GlassCard className="sa-glass space-y-4 rounded-3xl p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-pink-200/50 bg-white/50 p-3.5 dark:border-pink-900/30 dark:bg-slate-900/40">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300">
              <Calendar className="size-4" />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Yaratilgan vaqt</p>
              <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 sm:text-sm">
                {formatDateTime(item.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-pink-200/50 bg-white/50 p-3.5 dark:border-pink-900/30 dark:bg-slate-900/40">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Clock className="size-4" />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tasdiqlash muddati</p>
              <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 sm:text-sm">
                {formatDateTime(item.confirmationDeadline)}
              </p>
            </div>
          </div>
        </div>

        {(item.status === 'PENDING_CONFIRMATION' || nextStatuses.length > 0) ? (
          <div className="flex flex-wrap gap-2.5 border-t border-pink-200/50 pt-4 dark:border-pink-900/30">
            {item.status === 'PENDING_CONFIRMATION' ? (
              <Button
                type="button"
                className="flex-1 sm:flex-initial"
                disabled={confirm.isPending}
                onClick={() => void runAction(() => confirm.mutateAsync(id), 'Buyurtma tasdiqlandi')}
              >
                {confirm.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Tasdiqlash
              </Button>
            ) : null}
            {item.status === 'PENDING_CONFIRMATION' ? (
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-initial text-red-600 hover:bg-red-50 dark:text-red-300"
                disabled={reject.isPending}
                onClick={() => setShowReject((current) => !current)}
              >
                <XCircle className="size-4" />
                Rad etish
              </Button>
            ) : null}
            {nextStatuses.map((status) => (
              <Button
                key={status}
                type="button"
                variant="outline"
                className="flex-1 sm:flex-initial"
                disabled={updateStatus.isPending}
                onClick={() => handleStatusClick(status)}
              >
                {pendingStatus === status && updateStatus.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {orderStatusLabels[status]}
              </Button>
            ))}
          </div>
        ) : null}

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
