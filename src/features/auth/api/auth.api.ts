import { api } from '@/shared/api/api'
import { authMeResponseSchema, refreshResponseSchema, telegramLoginResponseSchema } from '../model/auth.schemas'
import type { CustomerUser, RefreshResponse, TelegramLoginResponse } from '../model/auth.types'

export const authApi = {
  async telegramLogin(initData: string, signal?: AbortSignal): Promise<TelegramLoginResponse> {
    const { data } = await api.post<unknown>('/auth/telegram', { initData }, { signal })
    return telegramLoginResponseSchema.parse(data)
  },

  async getMe(signal?: AbortSignal): Promise<CustomerUser> {
    const { data } = await api.get<unknown>('/auth/me', { signal })
    return authMeResponseSchema.parse(data).user
  },

  async refresh(signal?: AbortSignal): Promise<RefreshResponse> {
    const { data } = await api.post<unknown>('/auth/refresh', undefined, { signal })
    return refreshResponseSchema.parse(data)
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
}
