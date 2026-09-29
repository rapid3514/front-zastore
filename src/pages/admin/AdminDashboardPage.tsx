import { UserRoundCheck, UsersRound } from 'lucide-react'
import { useAdminDashboardQuery } from '@/features/admin/hooks/use-admin-dashboard-query'
import { PresenceStats, type PresenceStatItem } from '@/features/users/components/PresenceStats'
import { UserDirectoryError } from '@/features/users/components/UserDirectory'

export function AdminDashboardPage() {
  const statsQuery = useAdminDashboardQuery()
  const stats = statsQuery.data
  const items: PresenceStatItem[] = [
    { label: 'Jami mijozlar', value: stats?.totalCustomers ?? 0, icon: UsersRound, tone: 'violet' },
    { label: 'Online mijozlar', value: stats?.onlineCustomers ?? 0, icon: UserRoundCheck, tone: 'green' },
  ]

  return (
    <div className="sa-page-container space-y-6">
      <header><p className="sa-eyebrow">Mijozlar faolligi</p><h1 className="sa-page-title">Dashboard</h1><p className="sa-page-description">Mijozlar soni va hozirgi online holatini kuzating.</p></header>
      {statsQuery.isError
        ? <UserDirectoryError error={statsQuery.error} onRetry={() => void statsQuery.refetch()} />
        : <PresenceStats items={items} isLoading={statsQuery.isLoading} />}
    </div>
  )
}
