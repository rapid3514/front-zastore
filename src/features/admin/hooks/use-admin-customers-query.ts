import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/app/query-client'
import { adminApi, type GetCustomersParams } from '../api/admin.api'
import { adminKeys } from '../api/admin.keys'

export function useAdminCustomersQuery(params: GetCustomersParams) {
  return useQuery({
    queryKey: adminKeys.customers(params),
    queryFn: ({ signal }) => adminApi.getCustomers(params, signal),
    placeholderData: (previousData) => previousData,
    staleTime: QUERY_STALE_TIME.admin,
  })
}
