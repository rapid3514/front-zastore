import { watchTelegramTheme } from './telegram-theme'
import type { TelegramWebApp } from './telegram.types'

export function getTelegramWebApp(): TelegramWebApp | undefined {
  return window.Telegram?.WebApp
}

export function getTelegramInitData(): string | undefined {
  const initData = getTelegramWebApp()?.initData.trim()
  return initData || undefined
}

export function isTelegramEnvironment(): boolean {
  return Boolean(getTelegramWebApp())
}

export function requestTelegramContact(): Promise<boolean | null> {
  const webApp = getTelegramWebApp()
  if (!webApp?.requestContact) return Promise.resolve(null)

  return new Promise((resolve) => {
    webApp.requestContact?.((granted) => resolve(granted))
  })
}

export function initializeTelegramApp(onColorSchemeChange?: (scheme?: 'light' | 'dark') => void) {
  const webApp = getTelegramWebApp()

  if (!webApp) {
    return watchTelegramTheme(undefined, onColorSchemeChange)
  }

  webApp.ready()
  webApp.expand()
  return watchTelegramTheme(webApp, onColorSchemeChange)
}
