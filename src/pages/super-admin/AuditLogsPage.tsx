import { useState, type FormEvent } from 'react'
import { Eye, RefreshCw, ScrollText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { auditActions, auditEntityTypes, type AuditAction, type AuditEntityType, type AuditLog, type AuditLogsParams } from '@/features/audit/api/audit.api'
import { useAuditLogs } from '@/features/audit/hooks/use-audit-logs'
import { ModalShell } from '@/features/super-admin/components/ModalShell'
import { normalizeApiError } from '@/shared/api/api-error'
import { formatDateTime } from '@/shared/lib/format'

interface FilterDraft {
  actorUserId: string
  action: AuditAction | ''
  entityType: AuditEntityType | ''
  dateFrom: string
  dateTo: string
}

const emptyFilters: FilterDraft = { actorUserId: '', action: '', entityType: '', dateFrom: '', dateTo: '' }

export function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [draft, setDraft] = useState<FilterDraft>(emptyFilters)
  const [filters, setFilters] = useState<FilterDraft>(emptyFilters)
  const [selected, setSelected] = useState<AuditLog | null>(null)
  const params: AuditLogsParams = {
    page, limit: 20,
    ...(filters.actorUserId ? { actorUserId: filters.actorUserId } : {}),
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.entityType ? { entityType: filters.entityType } : {}),
    ...(filters.dateFrom ? { dateFrom: new Date(`${filters.dateFrom}T00:00:00`).toISOString() } : {}),
    ...(filters.dateTo ? { dateTo: new Date(`${filters.dateTo}T23:59:59.999`).toISOString() } : {}),
  }
  const logs = useAuditLogs(params)

  function applyFilters(event: FormEvent) {
    event.preventDefault()
    setFilters({ ...draft, actorUserId: draft.actorUserId.trim() })
    setPage(1)
  }

  return <div className="sa-page-container space-y-5">
    <header><p className="sa-eyebrow">Xavfsizlik va nazorat</p><h1 className="sa-page-title">Audit Logs</h1><p className="sa-page-description">Admin amallari va ularning sanitizatsiya qilingan metadata tafsilotlari.</p></header>
    <form onSubmit={applyFilters} className="sa-glass grid gap-3 rounded-2xl p-4 md:grid-cols-2 xl:grid-cols-5">
      <label className="text-sm font-bold text-slate-700">Actor user ID<input className="sa-input mt-2" value={draft.actorUserId} onChange={(event) => setDraft({ ...draft, actorUserId: event.target.value })} placeholder="UUID" pattern="[0-9a-fA-F-]{36}" /></label>
      <label className="text-sm font-bold text-slate-700">Action<select className="sa-input mt-2" value={draft.action} onChange={(event) => setDraft({ ...draft, action: event.target.value as AuditAction | '' })}><option value="">Barchasi</option>{auditActions.map((action) => <option key={action} value={action}>{action}</option>)}</select></label>
      <label className="text-sm font-bold text-slate-700">Entity<select className="sa-input mt-2" value={draft.entityType} onChange={(event) => setDraft({ ...draft, entityType: event.target.value as AuditEntityType | '' })}><option value="">Barchasi</option>{auditEntityTypes.map((entity) => <option key={entity} value={entity}>{entity}</option>)}</select></label>
      <label className="text-sm font-bold text-slate-700">Boshlanish<input type="date" className="sa-input mt-2" value={draft.dateFrom} max={draft.dateTo || undefined} onChange={(event) => setDraft({ ...draft, dateFrom: event.target.value })} /></label>
      <label className="text-sm font-bold text-slate-700">Tugash<input type="date" className="sa-input mt-2" value={draft.dateTo} min={draft.dateFrom || undefined} onChange={(event) => setDraft({ ...draft, dateTo: event.target.value })} /></label>
      <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-5"><Button type="submit">Filtrlash</Button><Button type="button" variant="outline" onClick={() => { setDraft(emptyFilters); setFilters(emptyFilters); setPage(1) }}>Tozalash</Button></div>
    </form>
    {logs.isLoading ? <div className="sa-glass h-72 animate-pulse rounded-2xl" /> : null}
    {logs.isError ? <div className="sa-glass rounded-2xl p-6 text-center text-red-600">{normalizeApiError(logs.error).message}<Button type="button" variant="outline" className="ml-2" onClick={() => void logs.refetch()}><RefreshCw className="size-4" />Qayta urinish</Button></div> : null}
    {logs.data?.data.length === 0 ? <div className="sa-glass rounded-2xl p-8 text-center"><ScrollText className="mx-auto size-9 text-slate-400" /><p className="mt-3 font-bold text-slate-700">Audit yozuvi topilmadi</p></div> : null}
    {logs.data?.data.length ? <>
      <div className="grid gap-3 md:hidden">{logs.data.data.map((log) => <AuditCard key={log.id} log={log} onOpen={setSelected} />)}</div>
      <div className="sa-glass hidden overflow-x-auto rounded-2xl md:block"><table className="w-full min-w-[62rem] text-left"><thead><tr className="text-xs font-extrabold uppercase tracking-wider text-slate-500"><th className="px-5 py-4">Vaqt</th><th className="px-5 py-4">Actor</th><th className="px-5 py-4">Action</th><th className="px-5 py-4">Entity</th><th className="px-5 py-4">Entity ID</th><th className="px-5 py-4">Metadata</th></tr></thead><tbody>{logs.data.data.map((log) => <tr key={log.id} className="border-t border-slate-200/70"><td className="px-5 py-4 text-sm text-slate-600">{formatDateTime(log.createdAt)}</td><td className="px-5 py-4"><p className="text-sm font-bold text-slate-800">{actorName(log)}</p><p className="text-xs text-slate-500">{log.actor.username ? `@${log.actor.username}` : log.actor.role}</p></td><td className="px-5 py-4 text-sm font-bold text-slate-700">{log.action}</td><td className="px-5 py-4 text-sm text-slate-600">{log.entityType}</td><td className="max-w-44 truncate px-5 py-4 text-sm text-slate-600" title={log.entityId}>{log.entityId}</td><td className="px-5 py-4"><Button type="button" variant="ghost" onClick={() => setSelected(log)}><Eye className="size-4" />Ko‘rish</Button></td></tr>)}</tbody></table></div>
    </> : null}
    {logs.data && logs.data.meta.totalPages > 1 ? <div className="flex items-center justify-center gap-3"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Oldingi</Button><span className="text-sm font-bold text-slate-700">{page} / {logs.data.meta.totalPages}</span><Button type="button" variant="outline" disabled={page >= logs.data.meta.totalPages} onClick={() => setPage(page + 1)}>Keyingi</Button></div> : null}
    <ModalShell open={selected !== null} title="Audit tafsilotlari" onOpenChange={(open) => { if (!open) setSelected(null) }}>{selected ? <AuditDetails log={selected} /> : null}</ModalShell>
  </div>
}

function actorName(log: AuditLog) { return [log.actor.firstName, log.actor.lastName].filter(Boolean).join(' ') }
function AuditCard({ log, onOpen }: { log: AuditLog; onOpen: (log: AuditLog) => void }) { return <article className="sa-glass rounded-2xl p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black text-slate-900">{log.action}</p><p className="mt-1 text-sm text-slate-500">{actorName(log)}</p></div><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{log.entityType}</span></div><p className="mt-3 text-xs text-slate-500">{formatDateTime(log.createdAt)}</p><Button type="button" variant="outline" className="mt-4 w-full" onClick={() => onOpen(log)}><Eye className="size-4" />Tafsilotlar</Button></article> }
function AuditDetails({ log }: { log: AuditLog }) { const entries = flattenMetadata(log.metadata); return <div className="space-y-4"><dl className="grid gap-3 text-sm sm:grid-cols-2"><Detail label="Actor" value={actorName(log)} /><Detail label="Action" value={log.action} /><Detail label="Entity" value={log.entityType} /><Detail label="Entity ID" value={log.entityId} /><Detail label="Vaqt" value={formatDateTime(log.createdAt)} /></dl><div><h3 className="font-extrabold text-slate-900">Metadata</h3>{entries.length ? <dl className="mt-3 grid gap-2">{entries.map(([key, value]) => <Detail key={key} label={key} value={value} />)}</dl> : <p className="mt-2 text-sm text-slate-500">Metadata mavjud emas.</p>}</div></div> }
function Detail({ label, value }: { label: string; value: string }) { return <div className="min-w-0 rounded-xl bg-slate-100/70 p-3"><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 break-words font-bold text-slate-800">{value}</dd></div> }

function flattenMetadata(value: unknown, prefix = '', result: Array<[string, string]> = []): Array<[string, string]> {
  if (result.length >= 30) return result
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const text = value === null ? 'null' : String(value)
    result.push([prefix || 'value', text.length > 180 ? `${text.slice(0, 180)}…` : text])
    return result
  }
  if (Array.isArray(value)) {
    value.slice(0, 20).forEach((item, index) => flattenMetadata(item, `${prefix}[${index}]`, result))
    return result
  }
  if (typeof value === 'object') {
    Object.entries(value).slice(0, 30).forEach(([key, item]) => flattenMetadata(item, prefix ? `${prefix}.${key}` : key, result))
  }
  return result
}
