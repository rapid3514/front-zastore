import { useQuery } from '@tanstack/react-query'
import { superAdminApi } from '../api/super-admin.api'
import { superAdminKeys } from '../api/super-admin.keys'

export function useSuperAdminDashboardQuery() {
  return useQuery({
    queryKey: superAdminKeys.stats(),
    queryFn: superAdminApi.getDashboardStats,
  })
}
