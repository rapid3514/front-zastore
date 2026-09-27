import { z } from 'zod'

export const customerUserSchema = z.object({
  id: z.string(),
  telegramId: z.string(),
  firstName: z.string(),
  lastName: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  role: z.enum(['GUEST', 'CUSTOMER', 'ADMIN', 'SUPER_ADMIN']),
  isBlocked: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const telegramLoginResponseSchema = z.union([
  z.object({
    registered: z.literal(true),
    accessToken: z.string().min(1),
    user: customerUserSchema,
  }),
  z.object({
    registered: z.literal(false),
    registrationRequired: z.literal(true),
  }),
])

export const refreshResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: customerUserSchema,
})

export const authMeResponseSchema = z.object({
  user: customerUserSchema,
})
