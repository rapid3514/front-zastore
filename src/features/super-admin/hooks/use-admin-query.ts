import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/app/query-client'
import { superAdminApi } from '../api/super-admin.api'
import { superAdminKeys } from '../api/super-admin.keys'

export function useAdminQuery(userId: string) {
  return useQuery({
    queryKey: superAdminKeys.admin(userId),
    queryFn: ({ signal }) => superAdminApi.getAdmin(userId, signal),
    enabled: Boolean(userId),
    staleTime: QUERY_STALE_TIME.admin,
  })
}
