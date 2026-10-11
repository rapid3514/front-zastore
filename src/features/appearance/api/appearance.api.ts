import { z } from 'zod'
import { api } from '@/shared/api/api'
import { queryKeys } from '@/shared/query/query-keys'

const appearanceSchema = z.object({
  backgroundUrl: z.string().url().nullable(),
  updatedAt: z.string().nullable(),
})

export type BotAppearance = z.infer<typeof appearanceSchema>
export interface AppearanceInput {
  background: { fileId: string; url: string } | null
}

export const appearanceKey = queryKeys.public.appearance()
export const appearanceApi = {
  async get(signal?: AbortSignal): Promise<BotAppearance> {
    const { data } = await api.get<unknown>('/appearance', { signal, timeout: 15_000 })
    return appearanceSchema.parse(data)
  },
  async update(input: AppearanceInput): Promise<BotAppearance> {
    const { data } = await api.patch<unknown>('/appearance', input)
    return appearanceSchema.parse(data)
  },
}
