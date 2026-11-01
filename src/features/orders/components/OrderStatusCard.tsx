import { Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Order, OrderStatus } from '../api/orders.api'
import { formatDateTime, formatMoney } from '@/shared/lib/format'

interface OrderStatusCardProps {
  order: Order
  detailHref?: string
}

function getStatusDetails(status: OrderStatus) {
  switch (status) {
    case 'PENDING_CONFIRMATION':
      return {
        label: 'Tasdiqlash kutilmoqda',
        subtext: 'Do‘kon xodimi tez orada buyurtmangizni ko‘rib chiqadi',
        progressWidth: '33%',
        activeStep: 1,
        badgeClass: 'border-pink-300/90 bg-pink-50 text-pink-700 dark:border-pink-500/40 dark:bg-pink-950/50 dark:text-pink-300',
        barClass: 'bg-pink-500',
      }
    case 'CONFIRMED':
      return {
        label: 'Tasdiqlandi',
        subtext: 'Buyurtmangiz tasdiqlandi va tayyorlanishga uzatildi',
        progressWidth: '50%',
        activeStep: 2,
        badgeClass: 'border-indigo-300/90 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-950/50 dark:text-indigo-300',
        barClass: 'bg-indigo-500',
      }
    case 'PROCESSING':
      return {
        label: 'Tayyorlanmoqda',
        subtext: 'Buyurtmangiz yig‘ilmoqda va yetkazib berishga tayyorlanmoqda',
        progressWidth: '70%',
        activeStep: 2,
        badgeClass: 'border-amber-300/90 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-300',
        barClass: 'bg-amber-500',
      }
    case 'COMPLETED':
      return {
        label: 'Yakunlandi',
        subtext: 'Buyurtmangiz muvaffaqiyatli yetkazib berildi va topshirildi',
        progressWidth: '100%',
        activeStep: 3,
        badgeClass: 'border-emerald-300/90 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/50 dark:text-emerald-300',
        barClass: 'bg-emerald-500',
      }
    case 'CANCELLED':
      return {
        label: 'Bekor qilindi',
        subtext: 'Ushbu buyurtma bekor qilingan',
        progressWidth: '100%',
        activeStep: 0,
        badgeClass: 'border-rose-300/90 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/50 dark:text-rose-300',
        barClass: 'bg-rose-400 opacity-60',
      }
    case 'EXPIRED':
      return {
        label: 'Muddati o‘tdi',
        subtext: 'Buyurtmani tasdiqlash muddati yakunlandi',
        progressWidth: '100%',
        activeStep: 0,
        badgeClass: 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
        barClass: 'bg-slate-400 opacity-50',
      }
  }
}

export function OrderStatusCard({ order, detailHref }: OrderStatusCardProps) {
  const statusInfo = getStatusDetails(order.status)
  const orderNumber = order.id.slice(0, 8).toUpperCase()
  const firstItem = order.items[0]
  const otherItemsCount = order.items.length - 1

  const content = (
    <article className="order-status-card group relative overflow-hidden rounded-[1.85rem] border border-pink-200/70 bg-white/90 p-5 shadow-sm transition-all hover:shadow-md dark:border-pink-900/30 dark:bg-[#20181c]/90">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-lg">
          BUYURTMA-#{orderNumber}
        </h3>
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${statusInfo.badgeClass}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Subtext info */}
      <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300 sm:text-sm">
        {statusInfo.subtext}
      </p>

      {/* 3-Step Progress Track */}
      {order.status !== 'CANCELLED' && order.status !== 'EXPIRED' ? (
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-3 text-center text-[0.72rem] font-bold text-slate-500 dark:text-slate-400 sm:text-xs">
            <span className={`text-left ${statusInfo.activeStep >= 1 ? 'font-black text-pink-600 dark:text-pink-400' : ''}`}>
              Qabul qilindi
            </span>
            <span className={statusInfo.activeStep >= 2 ? 'font-black text-pink-600 dark:text-pink-400' : ''}>
              Tayyorlanmoqda
            </span>
            <span className={`text-right ${statusInfo.activeStep >= 3 ? 'font-black text-pink-600 dark:text-pink-400' : ''}`}>
              Yetkazilmoqda
            </span>
          </div>

          {/* Progress bar track */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-pink-100 dark:bg-pink-950/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${statusInfo.barClass}`}
              style={{ width: statusInfo.progressWidth }}
            />
          </div>
        </div>
      ) : null}

      {/* Item summary box (Pinkish pill matching template) */}
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-pink-200/60 bg-pink-50/50 p-3 dark:border-pink-900/40 dark:bg-pink-950/30">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-300">
          <Package className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
            {firstItem ? `${firstItem.productName} (${firstItem.quantity} dona)` : 'Mahsulotlar'}
          </p>
          {otherItemsCount > 0 ? (
            <p className="mt-0.5 text-xs font-semibold text-pink-600 dark:text-pink-400">
              + yana {otherItemsCount} ta boshqa mahsulot
            </p>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-pink-100/80 pt-3 dark:border-pink-950/40">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {formatDateTime(order.createdAt)}
        </span>
        <strong className="text-base font-black text-slate-900 dark:text-slate-100 sm:text-lg">
          {formatMoney(order.total)}
        </strong>
      </div>
    </article>
  )

  if (detailHref) {
    return (
      <Link to={detailHref} className="block no-underline">
        {content}
      </Link>
    )
  }

  return content
}
