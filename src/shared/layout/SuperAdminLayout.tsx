import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Activity, LayoutDashboard, LogOut, Moon, ScrollText, ShieldCheck, Sun, UserCog, UserRound, UsersRound } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useTheme } from '@/features/theme/hooks/use-theme'
import { ConfirmDialog } from '@/features/super-admin/components/ConfirmDialog'
import { cn } from '@/shared/lib/cn'
import {
  loadAdminsPage,
  loadSuperAdminDashboardPage,
  loadSuperAdminProfilePage,
  loadSuperAdminUsersPage,
  loadAuditLogsPage,
  loadSystemStatusPage,
  preloadSuperAdminPages,
} from '@/app/admin-page-loaders'

const navigation: Array<{ label: string; to: string; icon: LucideIcon; end?: boolean; preload: () => Promise<unknown> }> = [
  { label: 'Dashboard', to: '/super-admin', icon: LayoutDashboard, end: true, preload: loadSuperAdminDashboardPage },
  { label: 'Foydalanuvchilar', to: '/super-admin/users', icon: UsersRound, preload: loadSuperAdminUsersPage },
  { label: 'Adminlar', to: '/super-admin/admins', icon: UserCog, preload: loadAdminsPage },
  { label: 'Audit', to: '/super-admin/audit-logs', icon: ScrollText, preload: loadAuditLogsPage },
  { label: 'Tizim holati', to: '/super-admin/system-status', icon: Activity, preload: loadSystemStatusPage },
  { label: 'Profil', to: '/super-admin/profile', icon: UserRound, preload: loadSuperAdminProfilePage },
]

function NavItems({ mobile = false }: { mobile?: boolean }) {
  return navigation.map(({ label, to, icon: Icon, end, preload }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      onPointerEnter={() => void preload()}
      onFocus={() => void preload()}
      onTouchStart={() => void preload()}
      className={({ isActive }) =>
        cn(
          mobile ? 'sa-mobile-nav-item' : 'sa-sidebar-link',
          isActive && (mobile ? 'sa-mobile-nav-item-active' : 'sa-sidebar-link-active'),
        )
      }
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </NavLink>
  ))
}

export function SuperAdminLayout() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const mobileNavRef = useRef<HTMLElement>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    void preloadSuperAdminPages()
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      mobileNavRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [location.pathname])

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="super-admin-layout super-admin-executive">
      <aside className="sa-sidebar">
        <div className="flex items-center gap-3 px-2">
          <span className="super-admin-brand-mark"><ShieldCheck className="size-6" /></span>
          <div>
            <p className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-100">Zastore</p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Boshqaruv markazi</p>
          </div>
        </div>
        <nav className="mt-8 grid gap-1.5" aria-label="Super admin navigatsiyasi"><NavItems /></nav>
        <div className="mt-auto border-t border-slate-200/80 pt-5 dark:border-slate-800">
          <p className="truncate px-3 text-sm font-bold text-slate-800 dark:text-slate-200">{user?.firstName} {user?.lastName}</p>
          <p className="mt-0.5 truncate px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400">SUPER ADMIN</p>
          <button
            type="button"
            onClick={toggleTheme}
            className="sa-sidebar-link mt-3 w-full"
            aria-label={isDark ? 'Yorug‘ rejimga o‘tish' : 'Qorong‘i rejimga o‘tish'}
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            <span>{isDark ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="sa-sidebar-link mt-1 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <LogOut className="size-5" />Chiqish
          </button>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-72">
        <header className="sa-mobile-topbar">
          <div>
            <p className="text-lg font-black tracking-tight text-slate-950 dark:text-slate-100">Super Admin</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Zastore Platform</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="sa-icon-button"
              aria-label={isDark ? 'Yorug‘ rejimga o‘tish' : 'Qorong‘i rejimga o‘tish'}
            >
              {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="sa-icon-button text-red-600"
              aria-label="Chiqish"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </header>

        <main className="sa-main"><Outlet /></main>
      </div>

      <nav ref={mobileNavRef} className="sa-mobile-bottom-nav" aria-label="Super admin mobil navigatsiyasi">
        <NavItems mobile />
      </nav>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Super Admin paneldan chiqish"
        description="Haqiqatan ham super admin sessiyasidan chiqmoqchimisiz?"
        confirmLabel="Chiqish"
        danger
        onConfirm={handleLogout}
        onOpenChange={setShowLogoutConfirm}
      />
    </div>
  )
}
