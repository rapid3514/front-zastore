import { z } from 'zod'
import { api } from '@/shared/api/api'
import { queryKeys } from '@/shared/query/query-keys'

const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Category = z.infer<typeof categorySchema>
export interface CategoryInput {
  name: string
  description?: string | null
  imageUrl?: string | null
  sortOrder?: number
}

export const categoryKeys = {
  publicAll: queryKeys.public.categories(),
  adminAll: queryKeys.admin.categories(),
  public: () => queryKeys.public.categories('list'),
  manage: () => queryKeys.admin.categories('list'),
  detail: (id: string) => queryKeys.public.categories('detail', id),
}

export const categoriesApi = {
  async getCategories(signal?: AbortSignal): Promise<Category[]> {
    const { data } = await api.get<unknown>('/categories', { signal })
    return z.array(categorySchema).parse(data)
  },
  async getCategoryById(id: string, signal?: AbortSignal): Promise<Category> {
    const { data } = await api.get<unknown>(`/categories/${id}`, { signal })
    return categorySchema.parse(data)
  },
  async getManageCategories(signal?: AbortSignal): Promise<Category[]> {
    const { data } = await api.get<unknown>('/categories/manage', { signal })
    return z.array(categorySchema).parse(data)
  },
  async createCategory(input: CategoryInput): Promise<Category> {
    const { data } = await api.post<unknown>('/categories', input)
    return categorySchema.parse(data)
  },
  async updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
    const { data } = await api.patch<unknown>(`/categories/${id}`, input)
    return categorySchema.parse(data)
  },
  async setCategoryActive(id: string, active: boolean): Promise<Category> {
    const { data } = await api.patch<unknown>(`/categories/${id}/${active ? 'activate' : 'deactivate'}`)
    return categorySchema.parse(data)
  },
  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}
