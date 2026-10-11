import { z } from 'zod'
import { api } from '@/shared/api/api'
import { queryKeys } from '@/shared/query/query-keys'

const appearanceSchema = z.object({
  backgroundUrl: z.string().url().nullable(),
  updatedAt: z.string().nullable(),
})
const appearanceLimitSchema = z.object({
  maxChanges: z.number().int().positive(),
  windowDays: z.number().int().positive(),
  used: z.number().int().nonnegative(),
  remaining: z.number().int().nonnegative(),
  nextAvailableAt: z.string().nullable(),
})

export type BotAppearance = z.infer<typeof appearanceSchema>
export type AppearanceLimit = z.infer<typeof appearanceLimitSchema>
export type AppearanceScope = 'bot' | 'super-admin'
export interface AppearanceInput {
  background: { fileId: string; url: string } | null
}

export const appearanceKey = (scope: AppearanceScope) => scope === 'super-admin'
  ? queryKeys.admin.superAdmin('appearance')
  : queryKeys.public.appearance()
const appearancePath = (scope: AppearanceScope) => scope === 'super-admin' ? '/appearance/super-admin' : '/appearance'
export const appearanceLimitKey = queryKeys.session.profile('appearance-limit')
export const appearanceApi = {
  async getLimit(signal?: AbortSignal): Promise<AppearanceLimit> {
    const { data } = await api.get<unknown>('/appearance/limits', { signal, timeout: 15_000 })
    return appearanceLimitSchema.parse(data)
  },
  async get(scope: AppearanceScope, signal?: AbortSignal): Promise<BotAppearance> {
    const { data } = await api.get<unknown>(appearancePath(scope), { signal, timeout: 15_000 })
    return appearanceSchema.parse(data)
  },
  async update(scope: AppearanceScope, input: AppearanceInput): Promise<BotAppearance> {
    const { data } = await api.patch<unknown>(appearancePath(scope), input)
    return appearanceSchema.parse(data)
  },
}
