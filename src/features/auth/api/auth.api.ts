import { api } from '@/shared/api/api'
import { authMeResponseSchema, refreshResponseSchema, telegramLoginResponseSchema } from '../model/auth.schemas'
import type { CustomerUser, RefreshResponse, TelegramLoginResponse } from '../model/auth.types'

export const authApi = {
  async telegramLogin(initData: string): Promise<TelegramLoginResponse> {
    const { data } = await api.post<unknown>('/auth/telegram', { initData })
    return telegramLoginResponseSchema.parse(data)
  },

  async getMe(): Promise<CustomerUser> {
    const { data } = await api.get<unknown>('/auth/me')
    return authMeResponseSchema.parse(data).user
  },

  async refresh(): Promise<RefreshResponse> {
    const { data } = await api.post<unknown>('/auth/refresh')
    return refreshResponseSchema.parse(data)
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
}
