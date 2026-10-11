import { useQuery } from '@tanstack/react-query'
import { appearanceApi, appearanceKey } from '../api/appearance.api'

export function useBotAppearance() {
  return useQuery({
    queryKey: appearanceKey,
    queryFn: ({ signal }) => appearanceApi.get(signal),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
}
