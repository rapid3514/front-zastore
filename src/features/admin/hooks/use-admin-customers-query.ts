import { useQuery } from '@tanstack/react-query'
import { adminApi, type GetCustomersParams } from '../api/admin.api'
import { adminKeys } from '../api/admin.keys'

export function useAdminCustomersQuery(params: GetCustomersParams) {
  return useQuery({
    queryKey: adminKeys.customers(params),
    queryFn: () => adminApi.getCustomers(params),
    placeholderData: (previousData) => previousData,
  })
}
