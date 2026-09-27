import { useQuery } from '@tanstack/react-query'
import { categoriesApi, categoryKeys } from '../api/categories.api'

export function useCategoriesQuery(enabled = true) {
  return useQuery({ queryKey: categoryKeys.public(), queryFn: categoriesApi.getCategories, enabled })
}
