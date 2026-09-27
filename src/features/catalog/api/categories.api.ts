import { z } from 'zod'
import { api } from '@/shared/api/api'

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
  all: ['categories'] as const,
  public: () => [...categoryKeys.all, 'public'] as const,
  manage: () => [...categoryKeys.all, 'manage'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
}

export const categoriesApi = {
  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<unknown>('/categories')
    return z.array(categorySchema).parse(data)
  },
  async getCategoryById(id: string): Promise<Category> {
    const { data } = await api.get<unknown>(`/categories/${id}`)
    return categorySchema.parse(data)
  },
  async getManageCategories(): Promise<Category[]> {
    const { data } = await api.get<unknown>('/categories/manage')
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
