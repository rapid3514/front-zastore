import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'zastore-theme'

function readStoredTheme(): ThemeMode | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

function applyThemeToDocument(theme: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.dataset.theme = theme
  root.style.colorScheme = theme
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#352b3e' : '#fff8fb')
}

const storedTheme = readStoredTheme()
const initialTheme = storedTheme ?? 'light'

interface ThemeState {
  theme: ThemeMode
  hasUserPreference: boolean
  setTheme: (theme: ThemeMode) => void
  setAutomaticTheme: (theme: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  hasUserPreference: storedTheme !== null,
  setTheme: (theme) => {
    applyThemeToDocument(theme)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // The selected theme still applies when storage is unavailable.
    }
    set({ theme, hasUserPreference: true })
  },
  setAutomaticTheme: (theme) => {
    if (get().hasUserPreference) return
    applyThemeToDocument(theme)
    set({ theme })
  },
}))

export function initializeTheme() {
  applyThemeToDocument(useThemeStore.getState().theme)
}

export function syncThemeFromTelegram(_theme?: ThemeMode) {
  // Keep the boutique bright unless the customer explicitly chooses dark mode.
  useThemeStore.getState().setAutomaticTheme('light')
}
