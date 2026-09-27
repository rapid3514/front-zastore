import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { BookOpenText, CalendarDays, Clock3, FolderOpen, LogOut, Moon, Package, ShoppingBag, Sun, UserRound, UtensilsCrossed } from 'lucide-react'
import { AccessDeniedPage } from '@/features/auth/ui/AccessDeniedPage'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useTheme } from '@/features/theme/hooks/use-theme'
import { AuthLoadingPage } from '@/pages/auth/AuthLoadingPage'
import { TelegramRequiredPage } from '@/pages/auth/TelegramRequiredPage'
import { cn } from '@/shared/lib/cn'

const navigation: Array<{ to: string; label: string; icon: LucideIcon; end?: boolean }> = [
  { to: '/admin', label: 'Bugun', icon: CalendarDays, end: true },
  { to: '/admin/menu', label: 'Menyu', icon: BookOpenText },
  { to: '/admin/products', label: 'Mahsulotlar', icon: Package },
  { to: '/admin/categories', label: 'Kategoriyalar', icon: FolderOpen },
  { to: '/admin/orders', label: 'Buyurtmalar', icon: ShoppingBag },
  { to: '/admin/work-hours', label: 'Ish vaqti', icon: Clock3 },
  { to: '/admin/profile', label: 'Profil', icon: UserRound },
]

function Navigation({ mobile = false }: { mobile?: boolean }) {
  return navigation.map(({ to, label, icon: Icon, end }) => (
    <NavLink key={to} to={to} end={end} className={({ isActive }) => cn(mobile ? 'sa-mobile-nav-item' : 'sa-sidebar-link', isActive && (mobile ? 'sa-mobile-nav-item-active' : 'sa-sidebar-link-active'))}>
      <Icon className="size-5" aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  ))
}

export function AdminEntryPage() {
  const { status, user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  if (status === 'idle' || status === 'loading') return <AuthLoadingPage />
  if (status !== 'authenticated') return <TelegramRequiredPage />
  if (user?.role !== 'ADMIN') return <AccessDeniedPage role={user?.role} />

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="super-admin-layout">
      <aside className="sa-sidebar">
        <div className="flex items-center gap-3 px-2"><span className="grid size-11 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"><UtensilsCrossed className="size-6" /></span><div><p className="text-lg font-black tracking-tight text-slate-950">Zastore</p><p className="text-xs font-semibold text-slate-500">Admin panel</p></div></div>
        <nav className="mt-9 grid gap-2" aria-label="Admin navigatsiyasi"><Navigation /></nav>
        <div className="mt-auto border-t border-slate-200/80 pt-5">
          <div className="flex items-center gap-3 px-2"><span className="sa-avatar size-10 rounded-xl">{user.firstName.charAt(0).toLocaleUpperCase('uz')}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{user.firstName} {user.lastName}</p><p className="mt-1 text-xs text-slate-500">ADMIN</p></div></div>
          <button type="button" onClick={toggleTheme} className="sa-sidebar-link mt-4 w-full" aria-label={isDark ? 'Yorug‘ rejimga o‘tish' : 'Qorong‘i rejimga o‘tish'}>{isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}<span>{isDark ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}</span></button>
          <button type="button" onClick={() => void handleLogout()} className="sa-sidebar-link mt-1 w-full text-red-600 hover:bg-red-50"><LogOut className="size-5" />Chiqish</button>
        </div>
      </aside>
      <div className="min-w-0 lg:pl-72">
        <header className="sa-mobile-topbar"><div><p className="text-lg font-black tracking-tight text-slate-950">Zastore Admin</p><p className="text-xs font-semibold text-slate-500">{user.firstName} {user.lastName}</p></div><div className="flex items-center gap-2"><button type="button" onClick={toggleTheme} className="sa-icon-button" aria-label={isDark ? 'Yorug‘ rejimga o‘tish' : 'Qorong‘i rejimga o‘tish'}>{isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}</button><button type="button" onClick={() => void handleLogout()} className="sa-icon-button" aria-label="Chiqish"><LogOut className="size-5" /></button></div></header>
        <main className="sa-main"><Outlet /></main>
      </div>
      <nav className="sa-mobile-bottom-nav" aria-label="Admin mobil navigatsiyasi"><Navigation mobile /></nav>
    </div>
  )
}
