import { z } from 'zod'
import { api } from '@/shared/api/api'
import { customerUserSchema } from '@/features/auth/model/auth.schemas'
import type { CustomerUser, UserRole } from '@/features/auth/model/auth.types'

export interface GetUsersParams {
  page: number
  limit: number
  search?: string
  role?: UserRole
}

export interface UsersPage {
  data: CustomerUser[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

const usersPageSchema = z.object({
  data: z.array(customerUserSchema),
  meta: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
})

export const usersApi = {
  async getUsers(params: GetUsersParams, signal?: AbortSignal): Promise<UsersPage> {
    const { data } = await api.get<unknown>('/users', { params, signal })
    return usersPageSchema.parse(data)
  },
}
