import type { TelegramWebApp } from './telegram.types'

const defaultTheme = {
  background: '#f7f8fa',
  text: '#182230',
  secondaryBackground: '#ffffff',
}

function setThemeValue(name: string, value: string) {
  document.documentElement.style.setProperty(name, value)
}

export function applyTelegramTheme(webApp?: TelegramWebApp) {
  const params = webApp?.themeParams
  setThemeValue('--telegram-bg-color', params?.bg_color ?? defaultTheme.background)
  setThemeValue('--telegram-text-color', params?.text_color ?? defaultTheme.text)
  setThemeValue('--telegram-secondary-bg-color', params?.secondary_bg_color ?? defaultTheme.secondaryBackground)
  setThemeValue('--tg-button', params?.button_color ?? '#df6129')
  setThemeValue('--tg-button-text', params?.button_text_color ?? '#ffffff')
  document.documentElement.dataset.telegramTheme = webApp?.colorScheme ?? 'light'
}

export function watchTelegramTheme(webApp?: TelegramWebApp, onColorSchemeChange?: (scheme?: 'light' | 'dark') => void) {
  if (!webApp) {
    applyTelegramTheme()
    onColorSchemeChange?.()
    return () => undefined
  }

  const updateTheme = () => {
    applyTelegramTheme(webApp)
    onColorSchemeChange?.(webApp.colorScheme)
  }
  updateTheme()
  webApp.onEvent('themeChanged', updateTheme)

  return () => webApp.offEvent('themeChanged', updateTheme)
}
