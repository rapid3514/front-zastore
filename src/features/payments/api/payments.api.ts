import { z } from 'zod'
import { api } from '@/shared/api/api'

export const paymentStatuses = ['PENDING', 'PAID', 'FAILED', 'CANCELLED'] as const
export type PaymentStatus = typeof paymentStatuses[number]

const paymentOrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.enum(['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'EXPIRED']),
  total: z.string(),
  createdAt: z.string(),
  user: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string().nullable(),
    username: z.string().nullable(),
  }),
})

const paymentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  amount: z.string(),
  status: z.enum(paymentStatuses),
  provider: z.string().nullable(),
  externalId: z.string().nullable(),
  paidAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  order: paymentOrderSchema,
  providerConfigured: z.boolean(),
  providerMessage: z.string().nullable(),
})

const paymentsPageSchema = z.object({
  data: z.array(paymentSchema),
  meta: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
})

export type Payment = z.infer<typeof paymentSchema>
export type PaymentsPage = z.infer<typeof paymentsPageSchema>

export interface PaymentsParams {
  page?: number
  limit?: number
  status?: PaymentStatus
  provider?: string
  dateFrom?: string
  dateTo?: string
}

export const paymentKeys = {
  all: ['payments'] as const,
  order: (orderId: string) => [...paymentKeys.all, 'order', orderId] as const,
  manage: (params: PaymentsParams) => [...paymentKeys.all, 'manage', params] as const,
  manageDetail: (id: string) => [...paymentKeys.all, 'manage-detail', id] as const,
}

export const paymentsApi = {
  async getForOrder(orderId: string): Promise<Payment> {
    const { data } = await api.get<unknown>(`/orders/${orderId}/payment`)
    return paymentSchema.parse(data)
  },
  async createForOrder(orderId: string): Promise<Payment> {
    const { data } = await api.post<unknown>(`/orders/${orderId}/payment`)
    return paymentSchema.parse(data)
  },
  async getManage(params: PaymentsParams): Promise<PaymentsPage> {
    const { data } = await api.get<unknown>('/payments/manage', { params })
    return paymentsPageSchema.parse(data)
  },
  async getManageById(id: string): Promise<Payment> {
    const { data } = await api.get<unknown>(`/payments/manage/${id}`)
    return paymentSchema.parse(data)
  },
}
