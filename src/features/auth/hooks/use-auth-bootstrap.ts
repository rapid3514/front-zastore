import { useEffect } from 'react'
import { normalizeApiError } from '@/shared/api/api-error'
import { getTelegramInitData, initializeTelegramApp, isTelegramEnvironment } from '@/shared/telegram/telegram'
import { syncThemeFromTelegram } from '@/features/theme/model/theme.store'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../model/auth.store'

type BootstrapResult =
  | { type: 'authenticated'; accessToken: string; user: Awaited<ReturnType<typeof authApi.getMe>> }
  | { type: 'registration-required' }
  | { type: 'unauthenticated' }
  | { type: 'error'; message: string }

let bootstrapPromise: Promise<BootstrapResult> | null = null

function getBootstrapResult(): Promise<BootstrapResult> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const initData = getTelegramInitData()

      try {
        if (initData) {
          const response = await authApi.telegramLogin(initData)
          return response.registered
            ? { type: 'authenticated', accessToken: response.accessToken, user: response.user }
            : { type: 'registration-required' }
        }

        const refresh = await authApi.refresh()
        return { type: 'authenticated', accessToken: refresh.accessToken, user: refresh.user }
      } catch (error) {
        return isTelegramEnvironment()
          ? { type: 'error', message: normalizeApiError(error).message }
          : { type: 'unauthenticated' }
      }
    })()
  }

  return bootstrapPromise
}

export function useAuthBootstrap() {

  useEffect(() => {
    const stopThemeWatcher = initializeTelegramApp(syncThemeFromTelegram)

    let active = true
    useAuthStore.getState().setLoading()

    void getBootstrapResult().then((result) => {
      if (!active) return

      const store = useAuthStore.getState()
      if (result.type === 'authenticated') store.setAuthenticated(result.accessToken, result.user)
      if (result.type === 'registration-required') store.setRegistrationRequired()
      if (result.type === 'unauthenticated') store.setUnauthenticated()
      if (result.type === 'error') store.setError(result.message)
    })

    return () => {
      active = false
      stopThemeWatcher()
    }
  }, [])
}
