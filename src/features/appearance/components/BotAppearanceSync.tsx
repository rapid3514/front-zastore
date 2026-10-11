import { useEffect } from 'react'
import { useBotAppearance } from '../hooks/use-bot-appearance'

export function BotAppearanceSync() {
  const { data } = useBotAppearance()

  useEffect(() => {
    if (!data) return
    if (data.backgroundUrl) {
      document.documentElement.style.setProperty('--bot-background-image', `url(${JSON.stringify(data.backgroundUrl)})`)
    } else {
      document.documentElement.style.removeProperty('--bot-background-image')
    }
  }, [data])

  useEffect(() => () => {
    document.documentElement.style.removeProperty('--bot-background-image')
  }, [])
  return null
}
