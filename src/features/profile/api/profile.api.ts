import { api } from '@/shared/api/api'
import { authMeResponseSchema } from '@/features/auth/model/auth.schemas'
import type { ProfileUser } from '../model/profile.types'

export const profileApi = {
  async getMe(signal?: AbortSignal): Promise<ProfileUser> {
    const { data } = await api.get<unknown>('/auth/me', { signal })
    return authMeResponseSchema.parse(data).user
  },
}
