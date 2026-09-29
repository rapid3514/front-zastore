import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/admin.api'
import { adminKeys } from '../api/admin.keys'

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: adminApi.getDashboardStats,
  })
}
