import { api } from '@/shared/api/api'

export const presenceApi = {
  async ping(signal?: AbortSignal): Promise<void> {
    await api.post('/presence/ping', undefined, { signal })
  },
}
