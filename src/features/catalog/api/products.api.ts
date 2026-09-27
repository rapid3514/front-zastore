import { z } from 'zod'
import { api } from '@/shared/api/api'

const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.string(),
  imageUrl: z.string().nullable(),
  categoryId: z.string().uuid(),
  category: z.object({ id: z.string().uuid(), name: z.string(), slug: z.string() }),
  isAvailable: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Product = z.infer<typeof productSchema>
export interface ProductInput {
  name: string
  description?: string | null
  price: number
  imageUrl?: string | null
  categoryId: string
  isAvailable?: boolean
  isActive?: boolean
}
export interface ProductsParams {
  page?: number
  limit?: number
  categoryId?: string
  search?: string
  isAvailable?: boolean
  isActive?: boolean
}

const productsPageSchema = z.object({
  data: z.array(productSchema),
  meta: z.object({ page: z.number(), limit: z.number(), total: z.number(), totalPages: z.number() }),
})
export type ProductsPage = z.infer<typeof productsPageSchema>

export const productKeys = {
  all: ['products'] as const,
  list: (params: ProductsParams) => [...productKeys.all, 'public', params] as const,
  manage: (params: ProductsParams) => [...productKeys.all, 'manage', params] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
}

export const productsApi = {
  async getProducts(params: ProductsParams): Promise<ProductsPage> {
    const { data } = await api.get<unknown>('/products', { params })
    return productsPageSchema.parse(data)
  },
  async getManageProducts(params: ProductsParams): Promise<ProductsPage> {
    const { data } = await api.get<unknown>('/products/manage', { params })
    return productsPageSchema.parse(data)
  },
  async getProductById(id: string): Promise<Product> {
    const { data } = await api.get<unknown>(`/products/${id}`)
    return productSchema.parse(data)
  },
  async createProduct(input: ProductInput): Promise<Product> {
    const { data } = await api.post<unknown>('/products', input)
    return productSchema.parse(data)
  },
  async updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
    const { data } = await api.patch<unknown>(`/products/${id}`, input)
    return productSchema.parse(data)
  },
  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`)
  },
}
