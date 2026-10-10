import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/app/query-client'
import { profileApi } from '../api/profile.api'
import { profileKeys } from '../api/profile.keys'

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: ({ signal }) => profileApi.getMe(signal),
    enabled,
    staleTime: QUERY_STALE_TIME.session,
  })
}
