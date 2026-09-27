import { useMemo, useState } from 'react'
import { Search, UserRoundPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/cn'
import { AdminCard } from '@/features/super-admin/components/AdminCard'
import { AdminTable } from '@/features/super-admin/components/AdminTable'
import { AdminEmptyState, AdminListSkeleton, SuperAdminError } from '@/features/super-admin/components/SuperAdminStates'
import { PromoteAdminDialog } from '@/features/super-admin/components/PromoteAdminDialog'
import { useAdminsQuery } from '@/features/super-admin/hooks/use-admins-query'
import type { AdminFilter } from '@/features/super-admin/types/super-admin.types'

const filters: Array<{ value: AdminFilter; label: string }> = [
  { value: 'all', label: 'Barchasi' },
  { value: 'active', label: 'Faol' },
  { value: 'blocked', label: 'Bloklangan' },
]

export function AdminsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<AdminFilter>('all')
  const [promoteOpen, setPromoteOpen] = useState(false)
  const adminsQuery = useAdminsQuery()

  const admins = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('uz')
    return (adminsQuery.data ?? []).filter((admin) => {
      const matchesFilter = filter === 'all' || (filter === 'blocked' ? admin.isBlocked : !admin.isBlocked)
      const searchable = [admin.firstName, admin.lastName, admin.username, admin.phone].filter(Boolean).join(' ').toLocaleLowerCase('uz')
      return matchesFilter && searchable.includes(query)
    })
  }, [adminsQuery.data, filter, search])

  return (
    <div className="sa-page-container space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="sa-eyebrow">Foydalanuvchi huquqlari</p><h1 className="sa-page-title">Adminlar</h1><p className="sa-page-description">Admin profillari va panelga kirish holatini boshqaring.</p></div>
        <Button type="button" onClick={() => setPromoteOpen(true)} className="bg-indigo-600 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"><UserRoundPlus className="size-4" />Admin tayinlash</Button>
      </header>

      <div className="sa-glass rounded-3xl p-3 sm:p-4">
        <label className="sa-search"><Search className="size-5 shrink-0 text-slate-400" /><span className="sr-only">Admin qidirish</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Admin qidirish..." /></label>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Admin holati">
          {filters.map((item) => <button key={item.value} type="button" role="tab" aria-selected={filter === item.value} onClick={() => setFilter(item.value)} className={cn('sa-filter-chip', filter === item.value && 'sa-filter-chip-active')}>{item.label}</button>)}
        </div>
      </div>

      {adminsQuery.isLoading ? <AdminListSkeleton /> : null}
      {adminsQuery.isError ? <SuperAdminError error={adminsQuery.error} onRetry={() => void adminsQuery.refetch()} /> : null}
      {!adminsQuery.isLoading && !adminsQuery.isError && (adminsQuery.data?.length ?? 0) === 0 ? <AdminEmptyState onPromote={() => setPromoteOpen(true)} /> : null}
      {!adminsQuery.isLoading && !adminsQuery.isError && (adminsQuery.data?.length ?? 0) > 0 && admins.length === 0 ? <div className="sa-glass rounded-3xl p-8 text-center"><h2 className="font-extrabold text-slate-950">Mos admin topilmadi</h2><p className="mt-2 text-sm text-slate-500">Qidiruv yoki filtrni o‘zgartirib ko‘ring.</p></div> : null}
      {admins.length > 0 ? <><div className="grid gap-3 lg:hidden">{admins.map((admin) => <AdminCard key={admin.id} admin={admin} />)}</div><AdminTable admins={admins} /></> : null}

      {promoteOpen ? <PromoteAdminDialog open={promoteOpen} onOpenChange={setPromoteOpen} /> : null}
    </div>
  )
}
