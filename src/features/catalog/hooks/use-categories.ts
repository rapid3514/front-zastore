import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/app/query-client'
import { categoriesApi, categoryKeys } from '../api/categories.api'

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.public(),
    queryFn: ({ signal }) => categoriesApi.getCategories(signal),
    staleTime: QUERY_STALE_TIME.public,
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: ({ signal }) => categoriesApi.getCategoryById(id, signal),
    enabled: Boolean(id),
    staleTime: QUERY_STALE_TIME.public,
  })
}

export function useManageCategories() {
  return useQuery({
    queryKey: categoryKeys.manage(),
    queryFn: ({ signal }) => categoriesApi.getManageCategories(signal),
    staleTime: QUERY_STALE_TIME.admin,
  })
}

export function useCategoryMutations() {
  const client = useQueryClient()
  const onSuccess = () => Promise.all([
    client.invalidateQueries({ queryKey: categoryKeys.publicAll }),
    client.invalidateQueries({ queryKey: categoryKeys.adminAll }),
  ])
  return {
    create: useMutation({ mutationFn: categoriesApi.createCategory, onSuccess }),
    update: useMutation({ mutationFn: ({ id, input }: { id: string; input: Parameters<typeof categoriesApi.updateCategory>[1] }) => categoriesApi.updateCategory(id, input), onSuccess }),
    setActive: useMutation({ mutationFn: ({ id, active }: { id: string; active: boolean }) => categoriesApi.setCategoryActive(id, active), onSuccess }),
    remove: useMutation({ mutationFn: categoriesApi.deleteCategory, onSuccess }),
  }
}
