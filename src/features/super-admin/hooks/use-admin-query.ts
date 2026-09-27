import { useQuery } from '@tanstack/react-query'
import { superAdminApi } from '../api/super-admin.api'
import { superAdminKeys } from '../api/super-admin.keys'

export function useAdminQuery(userId: string) {
  return useQuery({
    queryKey: superAdminKeys.admin(userId),
    queryFn: () => superAdminApi.getAdmin(userId),
    enabled: Boolean(userId),
  })
}
