import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoriesApi, categoryKeys } from '../api/categories.api'

export function useCategories() {
  return useQuery({ queryKey: categoryKeys.public(), queryFn: categoriesApi.getCategories })
}

export function useCategory(id: string) {
  return useQuery({ queryKey: categoryKeys.detail(id), queryFn: () => categoriesApi.getCategoryById(id), enabled: Boolean(id) })
}

export function useManageCategories() {
  return useQuery({ queryKey: categoryKeys.manage(), queryFn: categoriesApi.getManageCategories })
}

export function useCategoryMutations() {
  const client = useQueryClient()
  const onSuccess = () => client.invalidateQueries({ queryKey: categoryKeys.all })
  return {
    create: useMutation({ mutationFn: categoriesApi.createCategory, onSuccess }),
    update: useMutation({ mutationFn: ({ id, input }: { id: string; input: Parameters<typeof categoriesApi.updateCategory>[1] }) => categoriesApi.updateCategory(id, input), onSuccess }),
    setActive: useMutation({ mutationFn: ({ id, active }: { id: string; active: boolean }) => categoriesApi.setCategoryActive(id, active), onSuccess }),
    remove: useMutation({ mutationFn: categoriesApi.deleteCategory, onSuccess }),
  }
}
