export type TelegramThemeParams = Record<string, string | undefined>

export interface TelegramWebApp {
  initData: string
  colorScheme: 'light' | 'dark'
  themeParams: TelegramThemeParams
  ready(): void
  expand(): void
  close(): void
  requestContact?(callback: (granted: boolean) => void): void
  onEvent(eventType: 'themeChanged', eventHandler: () => void): void
  offEvent(eventType: 'themeChanged', eventHandler: () => void): void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }
}
