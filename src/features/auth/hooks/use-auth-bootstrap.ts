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

interface BootstrapState {
  controller: AbortController
  generation: number
  promise: Promise<BootstrapResult>
}

let bootstrapGeneration = 0
let bootstrapState: BootstrapState | null = null

function getBootstrapState(): BootstrapState {
  if (!bootstrapState || bootstrapState.generation !== bootstrapGeneration) {
    const controller = new AbortController()
    const generation = bootstrapGeneration
    const promise = (async () => {
      const initData = getTelegramInitData()

      try {
        if (initData) {
          const response = await authApi.telegramLogin(initData, controller.signal)
          return response.registered
            ? { type: 'authenticated', accessToken: response.accessToken, user: response.user }
            : { type: 'registration-required' }
        }

        const refresh = await authApi.refresh(controller.signal)
        return { type: 'authenticated', accessToken: refresh.accessToken, user: refresh.user }
      } catch (error) {
        return isTelegramEnvironment()
          ? { type: 'error', message: normalizeApiError(error).message }
          : { type: 'unauthenticated' }
      }
    })() satisfies Promise<BootstrapResult>
    bootstrapState = { controller, generation, promise }
  }

  return bootstrapState
}

/** Invalidate bootstrap work so a late auth response cannot restore a logged-out session. */
export function cancelAuthBootstrap(): void {
  bootstrapGeneration += 1
  const activeBootstrap = bootstrapState
  bootstrapState = null
  activeBootstrap?.controller.abort()
}

export function useAuthBootstrap() {

  useEffect(() => {
    const stopThemeWatcher = initializeTelegramApp(syncThemeFromTelegram)

    let active = true
    useAuthStore.getState().setLoading()

    const bootstrap = getBootstrapState()
    void bootstrap.promise.then((result) => {
      if (!active || bootstrap.generation !== bootstrapGeneration) return

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
