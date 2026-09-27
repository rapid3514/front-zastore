import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { env } from '@/shared/config/env'

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const authEndpoints = ['/auth/telegram', '/auth/refresh', '/auth/logout']
let refreshPromise: Promise<string> | null = null

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

function isAuthEndpoint(url?: string) {
  return authEndpoints.some((endpoint) => url?.includes(endpoint))
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api
      .post<{ accessToken: string; user: unknown }>('/auth/refresh')
      .then(({ data }) => {
        if (!data.accessToken) throw new Error('Refresh response has no access token.')
        useAuthStore.getState().setAccessToken(data.accessToken)
        return data.accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetriableRequestConfig | undefined
    const isUnauthorized = error.response?.status === 401

    if (!request || !isUnauthorized || request._retry || isAuthEndpoint(request.url)) {
      return Promise.reject(error)
    }

    request._retry = true

    try {
      const accessToken = await refreshAccessToken()
      request.headers.Authorization = `Bearer ${accessToken}`
      return api(request)
    } catch (refreshError) {
      useAuthStore.getState().setUnauthenticated()
      return Promise.reject(refreshError)
    }
  },
)
