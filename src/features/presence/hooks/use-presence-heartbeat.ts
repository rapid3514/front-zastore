import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { presenceApi } from '../api/presence.api'

const HEARTBEAT_INTERVAL_MS = 60_000
const LEADER_RETRY_INTERVAL_MS = 5_000
const HEARTBEAT_LOCK_NAME = 'zastore-presence-heartbeat'

export function usePresenceHeartbeat() {
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated')

  useEffect(() => {
    if (!isAuthenticated) return

    let disposed = false
    let heartbeatIntervalId: number | undefined
    let initialPingId: number | undefined
    let leaderRetryIntervalId: number | undefined
    let activePingController: AbortController | undefined
    let releaseLeadership: (() => void) | undefined
    let requestingLeadership = false
    let lockApiFailed = false

    const ping = () => {
      if (disposed || document.visibilityState !== 'visible' || activePingController) return

      const controller = new AbortController()
      activePingController = controller
      void presenceApi
        .ping(controller.signal)
        .catch(() => {
          // Presence is best-effort. The next interval retries silently.
        })
        .finally(() => {
          if (activePingController === controller) activePingController = undefined
        })
    }

    const stopHeartbeat = () => {
      if (initialPingId !== undefined) window.clearTimeout(initialPingId)
      if (heartbeatIntervalId !== undefined) window.clearInterval(heartbeatIntervalId)
      initialPingId = undefined
      heartbeatIntervalId = undefined
      activePingController?.abort()
      activePingController = undefined
    }

    const startHeartbeat = () => {
      if (heartbeatIntervalId !== undefined || document.visibilityState !== 'visible') return

      // Deferring the first ping lets React StrictMode finish its setup/cleanup probe.
      initialPingId = window.setTimeout(() => {
        initialPingId = undefined
        ping()
      }, 0)
      heartbeatIntervalId = window.setInterval(ping, HEARTBEAT_INTERVAL_MS)
    }

    const tryAcquireLeadership = () => {
      if (
        disposed ||
        requestingLeadership ||
        lockApiFailed ||
        document.visibilityState !== 'visible'
      ) return

      requestingLeadership = true
      void navigator.locks
        .request(HEARTBEAT_LOCK_NAME, { ifAvailable: true }, async (lock) => {
          if (!lock || disposed || document.visibilityState !== 'visible') return

          startHeartbeat()
          await new Promise<void>((resolve) => {
            releaseLeadership = resolve
          })
          releaseLeadership = undefined
          stopHeartbeat()
        })
        .catch(() => {
          lockApiFailed = true
          if (leaderRetryIntervalId !== undefined) window.clearInterval(leaderRetryIntervalId)
          leaderRetryIntervalId = undefined
          startHeartbeat()
        })
        .finally(() => {
          requestingLeadership = false
        })
    }

    const stopVisibleWork = () => {
      if (leaderRetryIntervalId !== undefined) window.clearInterval(leaderRetryIntervalId)
      leaderRetryIntervalId = undefined
      releaseLeadership?.()
      releaseLeadership = undefined
      stopHeartbeat()
    }

    const startVisibleWork = () => {
      if (document.visibilityState !== 'visible') return

      if (!('locks' in navigator) || lockApiFailed) {
        startHeartbeat()
        return
      }

      tryAcquireLeadership()
      leaderRetryIntervalId = window.setInterval(tryAcquireLeadership, LEADER_RETRY_INTERVAL_MS)
    }

    const handleVisibilityChange = () => {
      stopVisibleWork()
      if (document.visibilityState === 'visible') startVisibleWork()
    }

    startVisibleWork()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      stopVisibleWork()
    }
  }, [isAuthenticated])
}
