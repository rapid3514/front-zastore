import { useQuery } from '@tanstack/react-query'
import { healthApi } from '../api/health.api'

export const healthKeys = { all: ['health'] as const }

export function useHealth() {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: healthApi.getStatus,
    retry: false,
    refetchInterval: 30_000,
  })
}
