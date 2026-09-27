import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/features/theme/hooks/use-theme'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button type="button" role="switch" aria-checked={isDark} onClick={toggleTheme} className="theme-toggle-row">
      <span className="profile-menu-icon">{isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}</span>
      <span className="min-w-0 flex-1 text-left"><span className="block font-bold text-[#493a32]">Qorong‘i rejim</span><span className="mt-0.5 block text-sm text-[#806f65]">Ilova ko‘rinishini o‘zgartirish</span></span>
      <span className={`theme-switch ${isDark ? 'theme-switch-active' : ''}`} aria-hidden="true"><span /></span>
    </button>
  )
}
