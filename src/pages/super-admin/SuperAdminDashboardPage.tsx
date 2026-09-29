import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, UserRoundCheck, UserRoundPlus, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminCard } from '@/features/super-admin/components/AdminCard'
import { AdminEmptyState, SuperAdminError } from '@/features/super-admin/components/SuperAdminStates'
import { PromoteAdminDialog } from '@/features/super-admin/components/PromoteAdminDialog'
import { useAdminsQuery } from '@/features/super-admin/hooks/use-admins-query'
import { useSuperAdminDashboardQuery } from '@/features/super-admin/hooks/use-super-admin-dashboard-query'
import { PresenceStats, type PresenceStatItem } from '@/features/users/components/PresenceStats'

export function SuperAdminDashboardPage() {
  const [promoteOpen, setPromoteOpen] = useState(false)
  const adminsQuery = useAdminsQuery()
  const statsQuery = useSuperAdminDashboardQuery()
  const admins = adminsQuery.data ?? []
  const recentAdmins = [...admins].slice(-4).reverse()
  const stats = statsQuery.data
  const statItems: PresenceStatItem[] = [
    { label: 'Jami foydalanuvchilar', value: stats?.totalUsers ?? 0, icon: UsersRound, tone: 'blue' },
    { label: 'Online foydalanuvchilar', value: stats?.onlineUsers ?? 0, icon: UserRoundCheck, tone: 'green' },
    { label: 'Jami mijozlar', value: stats?.totalCustomers ?? 0, icon: UsersRound, tone: 'violet' },
    { label: 'Online mijozlar', value: stats?.onlineCustomers ?? 0, icon: UserRoundCheck, tone: 'green' },
    { label: 'Jami adminlar', value: stats?.totalAdmins ?? 0, icon: ShieldCheck, tone: 'blue' },
    { label: 'Online adminlar', value: stats?.onlineAdmins ?? 0, icon: ShieldCheck, tone: 'green' },
  ]

  return (
    <div className="sa-page-container space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="sa-eyebrow">Platform boshqaruvi</p><h1 className="sa-page-title">Dashboard</h1><p className="sa-page-description">Adminlar holatini kuzating va yangi admin tayinlang.</p></div>
        <Button type="button" onClick={() => setPromoteOpen(true)} className="bg-indigo-600 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"><UserRoundPlus className="size-4" />Admin tayinlash</Button>
      </header>

      {statsQuery.isError
        ? <SuperAdminError error={statsQuery.error} onRetry={() => void statsQuery.refetch()} />
        : <PresenceStats items={statItems} isLoading={statsQuery.isLoading} />}

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
