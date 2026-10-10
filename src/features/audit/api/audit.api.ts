import { z } from 'zod'
import { api } from '@/shared/api/api'
import { queryKeys } from '@/shared/query/query-keys'

export const auditActions = [
  'CATEGORY_CREATE', 'CATEGORY_UPDATE', 'CATEGORY_STATUS_CHANGE', 'CATEGORY_DELETE',
  'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_STATUS_CHANGE', 'PRODUCT_DELETE',
  'ORDER_CONFIRM', 'ORDER_REJECT', 'ORDER_STATUS_CHANGE', 'WORK_HOURS_UPDATE',
  'ADMIN_UPDATE', 'ADMIN_PROMOTE', 'ADMIN_DEMOTE', 'ADMIN_BLOCK', 'ADMIN_UNBLOCK',
] as const
export const auditEntityTypes = ['CATEGORY', 'PRODUCT', 'ORDER', 'WORK_HOURS', 'USER'] as const
export type AuditAction = typeof auditActions[number]
export type AuditEntityType = typeof auditEntityTypes[number]

const jsonValueSchema: z.ZodType<unknown> = z.lazy(() => z.union([
  z.string(), z.number(), z.boolean(), z.null(), z.array(jsonValueSchema), z.record(z.string(), jsonValueSchema),
]))

const auditLogSchema = z.object({
  id: z.string(),
  actorUserId: z.string(),
  actor: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string().nullable(),
    username: z.string().nullable(),
    role: z.enum(['GUEST', 'CUSTOMER', 'ADMIN', 'SUPER_ADMIN']),
  }),
  action: z.enum(auditActions),
  entityType: z.enum(auditEntityTypes),
  entityId: z.string(),
  metadata: jsonValueSchema.nullable(),
  createdAt: z.string(),
})

const auditLogsPageSchema = z.object({
  data: z.array(auditLogSchema),
  meta: z.object({ page: z.number(), limit: z.number(), total: z.number(), totalPages: z.number() }),
})

export type AuditLog = z.infer<typeof auditLogSchema>
export type AuditLogsPage = z.infer<typeof auditLogsPageSchema>

export interface AuditLogsParams {
  page?: number
  limit?: number
  actorUserId?: string
  action?: AuditAction
  entityType?: AuditEntityType
  dateFrom?: string
  dateTo?: string
}

export const auditKeys = {
  all: queryKeys.admin.audit(),
  list: (params: AuditLogsParams) => [...auditKeys.all, params] as const,
}

export const auditApi = {
  async getLogs(params: AuditLogsParams, signal?: AbortSignal): Promise<AuditLogsPage> {
    const { data } = await api.get<unknown>('/audit-logs', { params, signal })
    return auditLogsPageSchema.parse(data)
  },
}
