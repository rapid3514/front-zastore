import { api } from '@/shared/api/api'
import { authMeResponseSchema } from '@/features/auth/model/auth.schemas'
import type { ProfileUser } from '../model/profile.types'

export const profileApi = {
  async getMe(): Promise<ProfileUser> {
    const { data } = await api.get<unknown>('/auth/me')
    return authMeResponseSchema.parse(data).user
  },
}
