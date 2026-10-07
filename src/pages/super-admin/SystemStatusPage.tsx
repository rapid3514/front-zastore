import { Activity, CircleCheck, Database, RefreshCw, Server, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHealth } from '@/features/health/hooks/use-health'
import { normalizeApiError } from '@/shared/api/api-error'
import { formatDateTime } from '@/shared/lib/format'

export function SystemStatusPage() {
  const health = useHealth()

  return <div className="sa-page-container space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="sa-eyebrow">Infrastructure</p><h1 className="sa-page-title">System Status</h1><p className="sa-page-description">Application va database health holati.</p></div><Button type="button" variant="outline" disabled={health.isFetching} onClick={() => void health.refetch()}><RefreshCw className={`size-4 ${health.isFetching ? 'animate-spin' : ''}`} />Yangilash</Button></header>
    {health.isLoading ? <div className="grid gap-4 sm:grid-cols-2">{[1, 2].map((item) => <div key={item} className="sa-glass h-40 animate-pulse rounded-2xl" />)}</div> : null}
    {health.isError ? <div className="sa-glass rounded-2xl p-7 text-center"><TriangleAlert className="mx-auto size-10 text-red-500" /><h2 className="mt-3 text-lg font-black text-slate-900">Health endpoint bilan aloqa yo‘q</h2><p className="mt-2 text-sm text-slate-600">{normalizeApiError(health.error).message}</p></div> : null}
    {health.data ? <>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatusCard icon={Server} title="Application" value="Online" healthy />
        <StatusCard icon={Database} title="Database" value={health.data.database === 'up' ? 'Up' : 'Down'} healthy={health.data.database === 'up'} />
      </div>
      {health.data.database === 'down' ? <div className="flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-5 text-red-800"><TriangleAlert className="mt-0.5 size-5 shrink-0" /><div><h2 className="font-black">Database unavailable</h2><p className="mt-1 text-sm">Backend 503 holatini qaytardi. Maxfiy konfiguratsiya ma’lumotlari UI’da ko‘rsatilmaydi.</p></div></div> : null}
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-500"><Activity className="size-4" />Backend timestamp: {formatDateTime(health.data.timestamp)}</p>
    </> : null}
  </div>
}

function StatusCard({ icon: Icon, title, value, healthy }: { icon: typeof Server; title: string; value: string; healthy: boolean }) { return <article className="sa-glass rounded-2xl p-5"><div className="flex items-start justify-between gap-3"><span className={`grid size-11 place-items-center rounded-xl ${healthy ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}><Icon className="size-5" /></span>{healthy ? <CircleCheck className="size-5 text-emerald-500" /> : <TriangleAlert className="size-5 text-red-500" />}</div><p className="mt-5 text-sm font-semibold text-slate-500">{title}</p><p className={`mt-1 text-2xl font-black ${healthy ? 'text-emerald-600' : 'text-red-600'}`}>{value}</p></article> }
