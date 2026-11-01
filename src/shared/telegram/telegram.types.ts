export type TelegramThemeParams = Record<string, string | undefined>

export interface TelegramBackButton {
  isVisible: boolean
  onClick(callback: () => void): void
  offClick(callback: () => void): void
  show(): void
  hide(): void
}

export interface TelegramHapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
  notificationOccurred(type: 'error' | 'success' | 'warning'): void
  selectionChanged(): void
}

export interface TelegramMainButton {
  text: string
  color: string
  textColor: string
  isVisible: boolean
  isActive: boolean
  isProgressVisible: boolean
  setText(text: string): void
  onClick(callback: () => void): void
  offClick(callback: () => void): void
  show(): void
  hide(): void
  enable(): void
  disable(): void
  showProgress(leaveActive?: boolean): void
  hideProgress(): void
}

export interface TelegramWebApp {
  initData: string
  initDataUnsafe?: {
    start_param?: string
    [key: string]: unknown
  }
  colorScheme: 'light' | 'dark'
  themeParams: TelegramThemeParams
  BackButton?: TelegramBackButton
  HapticFeedback?: TelegramHapticFeedback
  MainButton?: TelegramMainButton
  ready(): void
  expand(): void
  close(): void
  openLink?(url: string, options?: { try_instant_view?: boolean }): void
  openTelegramLink?(url: string): void
  requestContact?(callback: (granted: boolean) => void): void
  onEvent(eventType: 'themeChanged' | 'backButtonClicked' | 'mainButtonClicked', eventHandler: () => void): void
  offEvent(eventType: 'themeChanged' | 'backButtonClicked' | 'mainButtonClicked', eventHandler: () => void): void
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }
}
