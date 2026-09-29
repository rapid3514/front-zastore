import { z } from 'zod'
import { api } from '@/shared/api/api'
import { parseUsersPage } from '@/features/users/model/user.schemas'
import type { UsersPage } from '@/features/users/model/user.types'

export interface AdminStats {
  totalCustomers: number
  onlineCustomers: number
}

export interface GetCustomersParams {
  page: number
  limit: number
  search?: string
  online?: boolean
}

const adminStatsSchema = z.object({
  totalCustomers: z.number().int().nonnegative(),
  onlineCustomers: z.number().int().nonnegative(),
})

export const adminApi = {
  async getDashboardStats(): Promise<AdminStats> {
    const { data } = await api.get<unknown>('/admin/dashboard/stats')
    return adminStatsSchema.parse(data)
  },

  async getCustomers(params: GetCustomersParams): Promise<UsersPage> {
    const { data } = await api.get<unknown>('/admin/customers', { params })
    const page = parseUsersPage(data)
    return { ...page, data: page.data.filter((user) => user.role === 'CUSTOMER') }
  },
}
