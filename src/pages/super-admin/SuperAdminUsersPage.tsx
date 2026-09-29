import { useState } from 'react'
import { DirectoryFilters, DirectoryPagination, UserDirectoryError, UserDirectoryResults, UserDirectorySkeleton } from '@/features/users/components/UserDirectory'
import { useSuperAdminUsersQuery } from '@/features/super-admin/hooks/use-super-admin-users-query'
import type { OnlineFilter, RoleFilter } from '@/features/users/model/user.types'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'

const PAGE_SIZE = 20

export function SuperAdminUsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<RoleFilter>('ALL')
  const [online, setOnline] = useState<OnlineFilter>('ALL')
  const debouncedSearch = useDebouncedValue(search.trim())
  const usersQuery = useSuperAdminUsersQuery({
    page,
    limit: PAGE_SIZE,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(role === 'ALL' ? {} : { role }),
    ...(online === 'ALL' ? {} : { online: online === 'ONLINE' }),
  })

  return (
    <div className="sa-page-container space-y-6">
      <header><p className="sa-eyebrow">Platform foydalanuvchilari</p><h1 className="sa-page-title">Userlar</h1><p className="sa-page-description">Barcha rollardagi foydalanuvchilar va ularning faolligi.</p></header>
      <DirectoryFilters
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1) }}
        role={role}
        onRoleChange={(value) => { setRole(value); setPage(1) }}
        online={online}
        onOnlineChange={(value) => { setOnline(value); setPage(1) }}
      />
      {usersQuery.isLoading ? <UserDirectorySkeleton /> : null}
      {usersQuery.isError ? <UserDirectoryError error={usersQuery.error} onRetry={() => void usersQuery.refetch()} /> : null}
      {usersQuery.data ? <UserDirectoryResults page={usersQuery.data} showRole /> : null}
      {usersQuery.data ? <DirectoryPagination page={page} totalPages={usersQuery.data.meta.totalPages} onPageChange={setPage} /> : null}
    </div>
  )
}
