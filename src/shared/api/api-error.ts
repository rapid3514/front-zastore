import { AxiosError } from 'axios'

export interface ApiError {
  status?: number
  message: string
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const payload = error.response?.data
    const backendMessage =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? (payload as { message?: unknown }).message
        : undefined
    const safeMessage = Array.isArray(backendMessage)
      ? backendMessage.filter((item): item is string => typeof item === 'string').join(' ')
      : typeof backendMessage === 'string'
        ? backendMessage
        : undefined

    if (status === 400) return { status, message: safeMessage || 'Kiritilgan ma’lumotlarni tekshiring.' }
    if (status === 401) return { status, message: 'Avtorizatsiya muddati tugadi.' }
    if (status === 403) return { status, message: 'Bu amal uchun ruxsatingiz yo‘q.' }
    if (status === 404) return { status, message: safeMessage || 'Ma’lumot topilmadi.' }
    if (status === 409) return { status, message: safeMessage || 'Bu amalni bajarib bo‘lmadi.' }
    if (status === 503) return { status, message: 'Tizim yoki ma’lumotlar bazasi vaqtincha mavjud emas.' }
    if (status && status >= 500) return { status, message: 'Serverda xatolik yuz berdi.' }

    return { status, message: safeMessage || 'Tarmoqqa ulanishda xatolik yuz berdi.' }
  }

  return { message: 'Xatolik yuz berdi.' }
}
