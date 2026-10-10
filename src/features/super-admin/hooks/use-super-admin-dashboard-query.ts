import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/app/query-client'
import { superAdminApi } from '../api/super-admin.api'
import { superAdminKeys } from '../api/super-admin.keys'

export function useSuperAdminDashboardQuery() {
  return useQuery({
    queryKey: superAdminKeys.stats(),
    queryFn: ({ signal }) => superAdminApi.getDashboardStats(signal),
    staleTime: QUERY_STALE_TIME.admin,
  })
}
