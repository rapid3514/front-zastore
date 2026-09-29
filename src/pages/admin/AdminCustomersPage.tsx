import { useState } from 'react'
import { DirectoryFilters, DirectoryPagination, UserDirectoryError, UserDirectoryResults, UserDirectorySkeleton } from '@/features/users/components/UserDirectory'
import { useAdminCustomersQuery } from '@/features/admin/hooks/use-admin-customers-query'
import type { OnlineFilter } from '@/features/users/model/user.types'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'

const PAGE_SIZE = 20

export function AdminCustomersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [online, setOnline] = useState<OnlineFilter>('ALL')
  const debouncedSearch = useDebouncedValue(search.trim())
  const customersQuery = useAdminCustomersQuery({
    page,
    limit: PAGE_SIZE,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(online === 'ALL' ? {} : { online: online === 'ONLINE' }),
  })

  return (
    <div className="sa-page-container space-y-6">
      <header><p className="sa-eyebrow">Foydalanuvchilar</p><h1 className="sa-page-title">Customerlar</h1><p className="sa-page-description">Mijozlarni qidiring va online holatini kuzating.</p></header>
      <DirectoryFilters
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1) }}
        online={online}
        onOnlineChange={(value) => { setOnline(value); setPage(1) }}
      />
      {customersQuery.isLoading ? <UserDirectorySkeleton /> : null}
      {customersQuery.isError ? <UserDirectoryError error={customersQuery.error} onRetry={() => void customersQuery.refetch()} /> : null}
      {customersQuery.data ? <UserDirectoryResults page={customersQuery.data} showRole={false} /> : null}
      {customersQuery.data ? <DirectoryPagination page={page} totalPages={customersQuery.data.meta.totalPages} onPageChange={setPage} /> : null}
    </div>
  )
}
