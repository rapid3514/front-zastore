import { useQuery } from '@tanstack/react-query'
import { appearanceApi, appearanceKey, type AppearanceScope } from '../api/appearance.api'

export function useBotAppearance(scope: AppearanceScope = 'bot', enabled = true) {
  return useQuery({
    queryKey: appearanceKey(scope),
    queryFn: ({ signal }) => appearanceApi.get(scope, signal),
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
}
