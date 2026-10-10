import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/app/query-client'
import { adminApi } from '../api/admin.api'
import { adminKeys } from '../api/admin.keys'

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: ({ signal }) => adminApi.getDashboardStats(signal),
    staleTime: QUERY_STALE_TIME.admin,
  })
}
