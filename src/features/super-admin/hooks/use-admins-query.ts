import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/app/query-client'
import { superAdminApi } from '../api/super-admin.api'
import { superAdminKeys } from '../api/super-admin.keys'

export function useAdminsQuery() {
  return useQuery({
    queryKey: superAdminKeys.admins(),
    queryFn: ({ signal }) => superAdminApi.getAdmins(signal),
    staleTime: QUERY_STALE_TIME.admin,
  })
}

export function useAdminProfileQuery() {
  return useQuery({
    queryKey: superAdminKeys.me(),
    queryFn: ({ signal }) => superAdminApi.getMyAdminProfile(signal),
    staleTime: QUERY_STALE_TIME.session,
  })
}
