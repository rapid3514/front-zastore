import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { presenceApi } from '../api/presence.api'

const HEARTBEAT_INTERVAL_MS = 60_000

export function usePresenceHeartbeat() {
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated')

  useEffect(() => {
    if (!isAuthenticated) return

    const ping = () => {
      void presenceApi.ping().catch(() => {
        // Presence is best-effort. The next interval retries silently.
      })
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') ping()
    }

    ping()
    const intervalId = window.setInterval(ping, HEARTBEAT_INTERVAL_MS)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated])
}
