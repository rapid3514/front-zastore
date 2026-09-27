import { ShieldCheck, UserRoundCheck, UserRoundX } from 'lucide-react'

interface SuperAdminStatsProps {
  total: number
  active: number
  blocked: number
}

const stats = [
  { key: 'total', label: 'Jami adminlar', icon: ShieldCheck, tone: 'indigo' },
  { key: 'active', label: 'Faol adminlar', icon: UserRoundCheck, tone: 'emerald' },
  { key: 'blocked', label: 'Bloklangan', icon: UserRoundX, tone: 'red' },
] as const

export function SuperAdminStats(values: SuperAdminStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
      {stats.map(({ key, label, icon: Icon, tone }) => (
        <article key={key} className="sa-glass min-w-0 rounded-2xl p-3.5 sm:rounded-3xl sm:p-5">
          <span className={`sa-stat-icon sa-stat-icon-${tone}`}><Icon className="size-5" aria-hidden="true" /></span>
          <p className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{values[key]}</p>
          <p className="mt-1 text-xs font-semibold leading-4 text-slate-500 sm:text-sm">{label}</p>
        </article>
      ))}
    </div>
  )
}
