import { useEffect } from 'react'
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

export function telegramHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') {
  try {
    const feedback = getTelegramWebApp()?.HapticFeedback
    if (!feedback) return
    if (type === 'success' || type === 'warning' || type === 'error') {
      feedback.notificationOccurred(type)
    } else {
      feedback.impactOccurred(type)
    }
  } catch {
    // Ignore in browsers where Telegram Haptics is not supported
  }
}

export function useTelegramBackButton(visible: boolean, onBack?: () => void) {
  useEffect(() => {
    const webApp = getTelegramWebApp()
    const backButton = webApp?.BackButton
    if (!backButton) return

    if (visible) {
      backButton.show()
    } else {
      backButton.hide()
    }

    if (visible && onBack) {
      backButton.onClick(onBack)
      return () => {
        backButton.offClick(onBack)
      }
    }
  }, [visible, onBack])
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
