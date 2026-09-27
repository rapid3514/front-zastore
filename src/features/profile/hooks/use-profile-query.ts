import { useQuery } from '@tanstack/react-query'
import { profileApi } from '../api/profile.api'
import { profileKeys } from '../api/profile.keys'

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: profileApi.getMe,
    enabled,
  })
}
