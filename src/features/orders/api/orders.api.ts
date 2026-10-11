import { z } from 'zod'
import { api } from '@/shared/api/api'
import { queryKeys } from '@/shared/query/query-keys'

export const orderStatuses = ['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'EXPIRED'] as const
export type OrderStatus = typeof orderStatuses[number]

export interface CreateOrderInput {
  items: Array<{ productId: string; quantity: number }>
  phone?: string
  deliveryAddress: string
  btcPostBranchNumber: string
  latitude?: number
  longitude?: number
  note?: string
}

export interface OrdersParams {
  status?: OrderStatus
  search?: string
  customerId?: string
  createdFrom?: string
  createdTo?: string
  page?: number
  limit?: number
}

const orderItemSchema = z.object({
  id: z.string(),
  productId: z.string().nullable(),
  productName: z.string(),
  imageUrl: z.string().nullable().optional(),
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
  btcPostBranchNumber: z.string().nullable().optional(),
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
  cancelReason: z.string().nullable(),
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

const orderManagementSummarySchema = z.object({
  orders: z.object({
    total: z.number().int().nonnegative(),
    pendingConfirmation: z.number().int().nonnegative(),
    confirmed: z.number().int().nonnegative(),
    processing: z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
    cancelled: z.number().int().nonnegative(),
    expired: z.number().int().nonnegative(),
    completedRevenue: z.string(),
  }),
  catalog: z.object({
    productsTotal: z.number().int().nonnegative(),
    productsAvailable: z.number().int().nonnegative(),
    categoriesTotal: z.number().int().nonnegative(),
    categoriesActive: z.number().int().nonnegative(),
  }),
  customersWithOrders: z.number().int().nonnegative(),
  recentOrders: z.array(orderSchema),
})
export type OrderManagementSummary = z.infer<typeof orderManagementSummarySchema>

export const orderKeys = {
  sessionAll: () => queryKeys.session.orders(),
  mineLists: () => queryKeys.session.orders('list', 'mine'),
  mine: (params: OrdersParams) => queryKeys.session.orders('list', 'mine', params),
  mineDetail: (id: string) => queryKeys.session.orders('detail', id),
  adminAll: () => queryKeys.admin.orders(),
  manageLists: () => queryKeys.admin.orders('list'),
  manage: (params: OrdersParams) => queryKeys.admin.orders('list', params),
  manageDetail: (id: string) => queryKeys.admin.orders('detail', id),
  manageSummary: () => queryKeys.admin.orders('summary'),
}

export const ordersApi = {
  async create(input: CreateOrderInput, idempotencyKey: string) {
    const { data } = await api.post<unknown>('/orders', input, { headers: { 'Idempotency-Key': idempotencyKey } })
    return orderSchema.parse(data)
  },
  async getMine(params: OrdersParams, signal?: AbortSignal) {
    const { data } = await api.get<unknown>('/orders/my', { params, signal })
    return ordersPageSchema.parse(data)
  },
  async getById(id: string, signal?: AbortSignal) {
    const { data } = await api.get<unknown>(`/orders/my/${id}`, { signal })
    return orderSchema.parse(data)
  },
  async cancel(id: string, reason?: string) {
    const { data } = await api.patch<unknown>(`/orders/${id}/cancel`, reason ? { reason } : undefined)
    return orderSchema.parse(data)
  },
  async manage(params: OrdersParams, signal?: AbortSignal) {
    const { data } = await api.get<unknown>('/orders/manage', { params, signal })
    return ordersPageSchema.parse(data)
  },
  async manageById(id: string, signal?: AbortSignal) {
    const { data } = await api.get<unknown>(`/orders/manage/${id}`, { signal })
    return orderSchema.parse(data)
  },
  async manageSummary(signal?: AbortSignal) {
    const { data } = await api.get<unknown>('/orders/manage/summary', { signal })
    return orderManagementSummarySchema.parse(data)
  },
  async confirm(id: string) {
    const { data } = await api.patch<unknown>(`/orders/${id}/confirm`)
    return orderSchema.parse(data)
  },
  async reject(id: string, reason?: string) {
    const { data } = await api.patch<unknown>(`/orders/${id}/reject`, reason ? { reason } : {})
    return orderSchema.parse(data)
  },
  async updateStatus(id: string, status: OrderStatus) {
    const { data } = await api.patch<unknown>(`/orders/${id}/status`, { status })
    return orderSchema.parse(data)
  },
}
