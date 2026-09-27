import { Clock3, LockKeyhole, Store } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'
import { useWorkHoursStatus } from '../hooks/use-work-hours'

function formatNextOpening(value?: string | null, timeZone?: string) {
  if (!value) return 'Keyingi ish vaqtida'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('uz-UZ', { weekday: 'long', hour: '2-digit', minute: '2-digit', timeZone }).format(date)
}

export function WorkHoursStatusBadge() {
  const status = useWorkHoursStatus()
  if (status.isLoading) return <div className="glass-card h-16 animate-pulse" aria-label="Ish vaqti yuklanmoqda" />
  if (status.isError || !status.data) return null

  const value = status.data
  const today = value.today ?? value.todayWorkHour
  const openTime = today?.openTime ?? value.openTime
  const closeTime = today?.closeTime ?? value.closeTime

  return <GlassCard className={`work-hours-status ${value.isOpen ? 'work-hours-status-open' : 'work-hours-status-closed'}`}>
    <span className="work-hours-status-icon">{value.isOpen ? <Store className="size-5" /> : <LockKeyhole className="size-5" />}</span>
    <div className="min-w-0">
      <p className="font-black">{value.isOpen ? 'Buyurtmalar qabul qilinmoqda' : 'Hozir buyurtmalar qabul qilinmayapti'}</p>
      {value.isOpen ? <p className="mt-1 flex items-center gap-1 text-xs"><Clock3 className="size-3.5" />Bugun: {openTime ?? '—'} — {closeTime ?? '—'}</p> : <p className="mt-1 text-xs">Keyingi ochilish: {formatNextOpening(value.nextOpenAt ?? value.nextOpening, value.timeZone)}</p>}
    </div>
  </GlassCard>
}
