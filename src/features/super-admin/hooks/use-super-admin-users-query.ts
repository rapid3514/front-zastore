import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/app/query-client'
import { superAdminApi, type GetSuperAdminUsersParams } from '../api/super-admin.api'
import { superAdminKeys } from '../api/super-admin.keys'

export function useSuperAdminUsersQuery(params: GetSuperAdminUsersParams) {
  return useQuery({
    queryKey: superAdminKeys.users(params),
    queryFn: ({ signal }) => superAdminApi.getUsers(params, signal),
    placeholderData: (previousData) => previousData,
    staleTime: QUERY_STALE_TIME.admin,
  })
}
