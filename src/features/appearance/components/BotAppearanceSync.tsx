import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { useBotAppearance } from '../hooks/use-bot-appearance'

export function BotAppearanceSync() {
  const userRole = useAuthStore((state) => state.user?.role)
  const status = useAuthStore((state) => state.status)
  const scope = userRole === 'SUPER_ADMIN' ? 'super-admin' : 'bot'
  const ready = status !== 'idle' && status !== 'loading'
  const { data } = useBotAppearance(scope, ready)

  useEffect(() => {
    if (ready && data?.backgroundUrl) {
      document.documentElement.style.setProperty('--bot-background-image', `url(${JSON.stringify(data.backgroundUrl)})`)
    } else {
      document.documentElement.style.removeProperty('--bot-background-image')
    }
  }, [data, scope, ready])

  useEffect(() => () => {
    document.documentElement.style.removeProperty('--bot-background-image')
  }, [])
  return null
}
