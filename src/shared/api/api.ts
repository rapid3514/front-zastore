import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { env } from '@/shared/config/env'

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
  _authGeneration?: number
  _accessTokenAtDispatch?: string | null
}

const authEndpoints = ['/auth/telegram', '/auth/refresh', '/auth/logout']
const AUTH_REFRESH_TIMEOUT_MS = 15_000

interface RefreshState {
  controller: AbortController
  generation: number
  promise: Promise<string>
}

let refreshState: RefreshState | null = null
let authGeneration = 0

export const api = axios.create({
  baseURL: env.VITE_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken
  const request = config as RetriableRequestConfig
  request._authGeneration = authGeneration
  request._accessTokenAtDispatch = accessToken

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

function isAuthEndpoint(url?: string) {
  return authEndpoints.some((endpoint) => url?.includes(endpoint))
}

async function refreshAccessToken(generation: number) {
  if (generation !== authGeneration) {
    throw new axios.CanceledError('The authentication session changed.')
  }

  if (!refreshState) {
    const controller = new AbortController()
    const promise = api
      .post<{ accessToken: string; user: unknown }>('/auth/refresh', undefined, {
        signal: controller.signal,
        timeout: AUTH_REFRESH_TIMEOUT_MS,
      })
      .then(({ data }) => {
        if (generation !== authGeneration) {
          throw new axios.CanceledError('The authentication session changed.')
        }
        if (!data.accessToken) throw new Error('Refresh response has no access token.')
        useAuthStore.getState().setAccessToken(data.accessToken)
        return data.accessToken
      })
      .finally(() => {
        if (refreshState?.promise === promise) refreshState = null
      })
    refreshState = { controller, generation, promise }
  }

  if (refreshState.generation !== generation) {
    throw new axios.CanceledError('The authentication session changed.')
  }
  return refreshState.promise
}

/** Prevent an in-flight refresh from restoring credentials after logout. */
export function cancelAuthRefresh(): void {
  authGeneration += 1
  const activeRefresh = refreshState
  refreshState = null
  activeRefresh?.controller.abort()
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetriableRequestConfig | undefined
    const isUnauthorized = error.response?.status === 401
    const currentAccessToken = useAuthStore.getState().accessToken

    if (
      !request ||
      !isUnauthorized ||
      request._retry ||
      isAuthEndpoint(request.url) ||
      !request._accessTokenAtDispatch ||
      !currentAccessToken ||
      request._authGeneration !== authGeneration
    ) {
      return Promise.reject(error)
    }

    request._retry = true

    try {
      const accessToken = request._accessTokenAtDispatch === currentAccessToken
        ? await refreshAccessToken(request._authGeneration)
        : currentAccessToken
      request.headers.Authorization = `Bearer ${accessToken}`
      return api(request)
    } catch (refreshError) {
      if (!axios.isCancel(refreshError)) useAuthStore.getState().setUnauthenticated()
      return Promise.reject(refreshError)
    }
  },
)
