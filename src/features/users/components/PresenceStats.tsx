import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export interface PresenceStatItem {
  label: string
  value: number
  icon: LucideIcon
  tone: 'blue' | 'green' | 'violet'
}

export function PresenceStats({ items, isLoading }: { items: PresenceStatItem[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className={`presence-stats-grid presence-stats-grid-${items.length}`}>
        {items.map((item) => <Skeleton key={item.label} className="h-32 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className={`presence-stats-grid presence-stats-grid-${items.length}`}>
      {items.map(({ label, value, icon: Icon, tone }) => (
        <article key={label} className="sa-glass presence-stat-card">
          <span className={`presence-stat-icon presence-stat-icon-${tone}`}><Icon className="size-5" aria-hidden="true" /></span>
          <p className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{value.toLocaleString('uz-UZ')}</p>
          <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">{label}</p>
        </article>
      ))}
    </div>
  )
}
