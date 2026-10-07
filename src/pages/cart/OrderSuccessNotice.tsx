import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Check, Clock3, X } from 'lucide-react'
import { useWorkHoursStatus } from '@/features/work-hours/hooks/use-work-hours'

interface OrderSuccessNoticeProps {
  orderId: string
  onDismiss: () => void
}

function getWorkHoursMessage(status: ReturnType<typeof useWorkHoursStatus>) {
  if (status.isLoading) return 'Botning ish vaqtini yuklayapmiz…'
  if (status.isError || !status.data) {
    return 'Buyurtmangiz botning ish vaqtida ko‘rib chiqiladi.'
  }

  const today = status.data.today ?? status.data.todayWorkHour
  if (today?.isOpen && today.openTime && today.closeTime) {
    return `Botning bugungi ish vaqti: ${today.openTime}–${today.closeTime}. Buyurtmangiz shu vaqt oralig‘ida ko‘rib chiqiladi.`
  }

  if (status.data.nextOpenAt) {
    const nextOpen = new Date(status.data.nextOpenAt)
    if (!Number.isNaN(nextOpen.getTime())) {
      const nextOpening = new Intl.DateTimeFormat('uz-UZ', {
        timeZone: status.data.timeZone,
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }).format(nextOpen)
      return `Bugun bot ishlamaydi. Buyurtmangiz keyingi ish vaqtida — ${nextOpening} dan boshlab ko‘rib chiqiladi.`
    }
  }

  return 'Bugun bot ishlamaydi. Buyurtmangiz keyingi ish vaqtida ko‘rib chiqiladi.'
}

export function OrderSuccessNotice({ orderId, onDismiss }: OrderSuccessNoticeProps) {
  const workHours = useWorkHoursStatus()

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onDismiss])

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onDismiss}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-success-notice-title"
        className="relative w-full max-w-md rounded-3xl border border-white/80 bg-white/95 p-6 text-center text-slate-800 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Bildirishnomani yopish"
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          onClick={onDismiss}
        >
          <X size={20} />
        </button>
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <Check size={30} strokeWidth={2.5} />
        </div>
        <h2 id="order-success-notice-title" className="px-5 text-xl font-black">
          Buyurtma muvaffaqiyatli yuborildi!
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Buyurtma raqami: <strong>#{orderId.slice(0, 8)}</strong>. Buyurtmangiz ish vaqtimiz davomida ko‘rib chiqiladi.
        </p>
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-left text-sm text-rose-950">
          <Clock3 className="mt-0.5 size-5 shrink-0 text-rose-600" />
          <p>{getWorkHoursMessage(workHours)}</p>
        </div>
        <button type="button" className="shop-success-button mt-5" onClick={onDismiss}>
          Tushunarli
        </button>
      </section>
    </div>,
    document.body,
  )
}
