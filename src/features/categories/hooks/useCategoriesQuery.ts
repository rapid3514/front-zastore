import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/app/query-client'
import { categoriesApi, categoryKeys } from '../api/categories.api'

export function useCategoriesQuery(enabled = true) {
  return useQuery({
    queryKey: categoryKeys.public(),
    queryFn: ({ signal }) => categoriesApi.getCategories(signal),
    enabled,
    staleTime: QUERY_STALE_TIME.public,
  })
}
