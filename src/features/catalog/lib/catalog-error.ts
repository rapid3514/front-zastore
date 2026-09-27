import { isAxiosError } from 'axios'
import { normalizeApiError } from '@/shared/api/api-error'

export function catalogError(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) return message
    if (Array.isArray(message)) {
      const joined = message.filter((item): item is string => typeof item === 'string').join(' ')
      if (joined) return joined
    }
    if (error.response?.status === 404) return 'Ma’lumot topilmadi.'
  }
  return normalizeApiError(error).message
}
