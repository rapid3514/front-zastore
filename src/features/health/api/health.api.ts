import { AxiosError } from 'axios'
import { z } from 'zod'
import { api } from '@/shared/api/api'
import { env } from '@/shared/config/env'

const healthSchema = z.object({
  status: z.enum(['ok', 'error']),
  database: z.enum(['up', 'down']),
  timestamp: z.string(),
})

export type HealthStatus = z.infer<typeof healthSchema>

function getHealthUrl() {
  const configuredUrl = new URL(env.VITE_API_URL, window.location.origin)
  return new URL('/health', configuredUrl.origin).toString()
}

export const healthApi = {
  async getStatus(): Promise<HealthStatus> {
    try {
      const { data } = await api.get<unknown>(getHealthUrl())
      return healthSchema.parse(data)
    } catch (cause) {
      if (cause instanceof AxiosError && cause.response?.status === 503) {
        const parsed = healthSchema.safeParse(cause.response.data)
        return parsed.success
          ? parsed.data
          : { status: 'error', database: 'down', timestamp: new Date().toISOString() }
      }
      throw cause
    }
  },
}
