import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import type { OrderStatus } from '../api/orders.api'
import { formatDateTime } from '@/shared/lib/format'

export function ConfirmationDeadline({ value, status }: { value: string; status: OrderStatus }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (status !== 'PENDING_CONFIRMATION') return
    const interval = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(interval)
  }, [status])

  const remaining = new Date(value).getTime() - now
  let label = formatDateTime(value)
  if (status === 'PENDING_CONFIRMATION') label = remaining > 0 ? `${formatRemaining(remaining)} qoldi` : 'Tasdiqlash vaqti tugagan'

  return <div className="flex items-start gap-2 rounded-2xl bg-amber-50/80 p-3 text-sm font-semibold text-amber-900"><Clock3 className="mt-0.5 size-4 shrink-0" /><span>Tasdiqlash muddati: {label}</span></div>
}

function formatRemaining(milliseconds: number) {
  const totalMinutes = Math.max(0, Math.ceil(milliseconds / 60_000))
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `${days} kun ${hours} soat`
  if (hours > 0) return `${hours} soat ${minutes} daqiqa`
  return `${minutes} daqiqa`
}
