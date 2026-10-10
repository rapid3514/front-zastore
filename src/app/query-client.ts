import { QueryClient } from '@tanstack/react-query'
import { queryRetryDelay, shouldRetryQuery } from '@/shared/query/retry-policy'

export const QUERY_STALE_TIME = {
  default: 30_000,
  public: 60_000,
  session: 30_000,
  admin: 10_000,
} as const

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      retryDelay: queryRetryDelay,
      staleTime: QUERY_STALE_TIME.default,
      refetchOnWindowFocus: false,
    },
  },
})
