import { z } from 'zod'
import { api } from '@/shared/api/api'

export const orderStatuses = ['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'EXPIRED'] as const
export type OrderStatus = typeof orderStatuses[number]

export interface CreateOrderInput {
  items: Array<{ productId: string; quantity: number }>
  phone?: string
  deliveryAddress?: string
  latitude?: number
  longitude?: number
  note?: string
}

export interface OrdersParams {
  status?: OrderStatus
  search?: string
  page?: number
  limit?: number
}

const orderItemSchema = z.object({
  id: z.string(),
  productId: z.string().nullable(),
  productName: z.string(),
  quantity: z.number(),
  unitPrice: z.string(),
  lineTotal: z.string(),
})

const orderSchema = z.object({
  id: z.string(),
  status: z.enum(orderStatuses),
  customer: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
  }),
  phone: z.string().nullable(),
  deliveryAddress: z.string().nullable(),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  note: z.string().nullable(),
  subtotal: z.string(),
  total: z.string(),
  confirmationDeadline: z.string(),
  confirmedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  expiredAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(orderItemSchema),
})

export type Order = z.infer<typeof orderSchema>

const ordersPageSchema = z.object({
  data: z.array(orderSchema),
  meta: z.object({ page: z.number(), limit: z.number(), total: z.number(), totalPages: z.number() }).optional(),
})
export type OrdersPage = z.infer<typeof ordersPageSchema>

export const orderKeys = {
  all: ['orders'] as const,
  mine: (params: OrdersParams) => [...orderKeys.all, 'mine', params] as const,
  mineDetail: (id: string) => [...orderKeys.all, 'mine-detail', id] as const,
  manage: (params: OrdersParams) => [...orderKeys.all, 'manage', params] as const,
  manageDetail: (id: string) => [...orderKeys.all, 'manage-detail', id] as const,
}

export const ordersApi = {
  async create(input: CreateOrderInput) {
    const { data } = await api.post<unknown>('/orders', input)
    return orderSchema.parse(data)
  },
  async getMine(params: OrdersParams) {
    const { data } = await api.get<unknown>('/orders/my', { params })
    return ordersPageSchema.parse(data)
  },
  async getById(id: string) {
    const { data } = await api.get<unknown>(`/orders/${id}`)
    return orderSchema.parse(data)
  },
  async cancel(id: string, reason?: string) {
    const { data } = await api.patch<unknown>(`/orders/${id}/cancel`, reason ? { reason } : undefined)
    return orderSchema.parse(data)
  },
  async manage(params: OrdersParams) {
    const { data } = await api.get<unknown>('/orders/manage', { params })
    return ordersPageSchema.parse(data)
  },
  async manageById(id: string) {
    const { data } = await api.get<unknown>(`/orders/manage/${id}`)
    return orderSchema.parse(data)
  },
  async confirm(id: string) {
    const { data } = await api.patch<unknown>(`/orders/${id}/confirm`)
    return orderSchema.parse(data)
  },
  async updateStatus(id: string, status: OrderStatus) {
    const { data } = await api.patch<unknown>(`/orders/${id}/status`, { status })
    return orderSchema.parse(data)
  },
}
