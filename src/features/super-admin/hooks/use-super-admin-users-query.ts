import { useQuery } from '@tanstack/react-query'
import { superAdminApi, type GetSuperAdminUsersParams } from '../api/super-admin.api'
import { superAdminKeys } from '../api/super-admin.keys'

export function useSuperAdminUsersQuery(params: GetSuperAdminUsersParams) {
  return useQuery({
    queryKey: superAdminKeys.users(params),
    queryFn: () => superAdminApi.getUsers(params),
    placeholderData: (previousData) => previousData,
  })
}
