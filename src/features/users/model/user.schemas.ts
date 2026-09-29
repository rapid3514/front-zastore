import { z } from 'zod'
import type { UserListItem, UsersPage } from './user.types'

const telegramIdSchema = z.union([z.string(), z.number()]).nullable().optional()

const userListItemSchema = z.object({
  id: z.string(),
  fullName: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  telegramId: telegramIdSchema,
  avatarUrl: z.string().nullable().optional(),
  role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']),
  lastSeenAt: z.string().nullable().optional(),
  isOnline: z.boolean(),
})

const usersPageSchema = z.object({
  data: z.array(userListItemSchema),
  meta: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
})

export function parseUsersPage(payload: unknown): UsersPage {
  const parsed = usersPageSchema.parse(payload)

  return {
    meta: parsed.meta,
    data: parsed.data.map((user): UserListItem => {
      const derivedName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()

      return {
        id: user.id,
        fullName: user.fullName?.trim() || derivedName || null,
        username: user.username ?? null,
        telegramId: user.telegramId == null ? null : String(user.telegramId),
        avatarUrl: user.avatarUrl ?? null,
        role: user.role,
        lastSeenAt: user.lastSeenAt ?? null,
        isOnline: user.isOnline,
      }
    }),
  }
}
