import { useThemeStore } from '../model/theme.store'

export function useTheme() {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const isDark = theme === 'dark'

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme: () => setTheme(isDark ? 'light' : 'dark'),
  }
}
