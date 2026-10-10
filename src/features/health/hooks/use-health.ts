import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/app/query-client'
import { queryKeys } from '@/shared/query/query-keys'
import { healthApi } from '../api/health.api'

export const healthKeys = { all: queryKeys.public.health() }

export function useHealth() {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: ({ signal }) => healthApi.getStatus(signal),
    retry: false,
    staleTime: QUERY_STALE_TIME.public,
    refetchInterval: 30_000,
  })
}
