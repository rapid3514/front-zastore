import { api } from '@/shared/api/api'

export const presenceApi = {
  async ping(): Promise<void> {
    await api.post('/presence/ping')
  },
}
