import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, UserRoundPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminCard } from '@/features/super-admin/components/AdminCard'
import { AdminEmptyState, SuperAdminError } from '@/features/super-admin/components/SuperAdminStates'
import { PromoteAdminDialog } from '@/features/super-admin/components/PromoteAdminDialog'
import { SuperAdminStats } from '@/features/super-admin/components/SuperAdminStats'
import { useAdminsQuery } from '@/features/super-admin/hooks/use-admins-query'

export function SuperAdminDashboardPage() {
  const [promoteOpen, setPromoteOpen] = useState(false)
  const adminsQuery = useAdminsQuery()
  const admins = adminsQuery.data ?? []
  const active = admins.filter((admin) => !admin.isBlocked).length
  const blocked = admins.filter((admin) => admin.isBlocked).length
  const recentAdmins = [...admins].slice(-4).reverse()

  return (
    <div className="sa-page-container space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="sa-eyebrow">Platform boshqaruvi</p><h1 className="sa-page-title">Dashboard</h1><p className="sa-page-description">Adminlar holatini kuzating va yangi admin tayinlang.</p></div>
        <Button type="button" onClick={() => setPromoteOpen(true)} className="bg-indigo-600 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"><UserRoundPlus className="size-4" />Admin tayinlash</Button>
      </header>

      {adminsQuery.isLoading ? <div className="grid grid-cols-3 gap-2.5 sm:gap-4">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-36 rounded-3xl" />)}</div> : <SuperAdminStats total={admins.length} active={active} blocked={blocked} />}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4"><div><h2 className="text-xl font-black tracking-tight text-slate-950">Adminlar boshqaruvi</h2><p className="mt-1 text-sm text-slate-500">Yaqinda ro‘yxatga qo‘shilgan adminlar</p></div><Button asChild variant="ghost" className="shrink-0 text-indigo-700"><Link to="/super-admin/admins">Barchasi<ArrowRight className="size-4" /></Link></Button></div>
        {adminsQuery.isError ? <SuperAdminError error={adminsQuery.error} onRetry={() => void adminsQuery.refetch()} /> : null}
        {!adminsQuery.isLoading && !adminsQuery.isError && admins.length === 0 ? <AdminEmptyState onPromote={() => setPromoteOpen(true)} /> : null}
        {!adminsQuery.isLoading && !adminsQuery.isError && recentAdmins.length > 0 ? <div className="grid gap-3 sm:grid-cols-2">{recentAdmins.map((admin) => <AdminCard key={admin.id} admin={admin} />)}</div> : null}
      </section>

      {promoteOpen ? <PromoteAdminDialog open={promoteOpen} onOpenChange={setPromoteOpen} /> : null}
    </div>
  )
}
