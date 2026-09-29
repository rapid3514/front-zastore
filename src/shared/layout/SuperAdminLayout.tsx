import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, LogOut, ShieldCheck, ShoppingBag, UserCog, UserRound, UsersRound } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { cn } from '@/shared/lib/cn'
import {
  loadAdminOrdersPage,
  loadAdminsPage,
  loadSuperAdminDashboardPage,
  loadSuperAdminProfilePage,
  loadSuperAdminUsersPage,
  preloadSuperAdminPages,
} from '@/app/admin-page-loaders'

const navigation: Array<{ label: string; to: string; icon: LucideIcon; end?: boolean; preload: () => Promise<unknown> }> = [
  { label: 'Dashboard', to: '/super-admin', icon: LayoutDashboard, end: true, preload: loadSuperAdminDashboardPage },
  { label: 'Userlar', to: '/super-admin/users', icon: UsersRound, preload: loadSuperAdminUsersPage },
  { label: 'Adminlar', to: '/super-admin/admins', icon: UserCog, preload: loadAdminsPage },
  { label: 'Buyurtmalar', to: '/super-admin/orders', icon: ShoppingBag, preload: loadAdminOrdersPage },
  { label: 'Profil', to: '/super-admin/profile', icon: UserRound, preload: loadSuperAdminProfilePage },
]

function NavItems({ mobile = false }: { mobile?: boolean }) {
  return navigation.map(({ label, to, icon: Icon, end, preload }) => (
    <NavLink key={to} to={to} end={end} onPointerEnter={() => void preload()} onFocus={() => void preload()} onTouchStart={() => void preload()} className={({ isActive }) => cn(mobile ? 'sa-mobile-nav-item' : 'sa-sidebar-link', isActive && (mobile ? 'sa-mobile-nav-item-active' : 'sa-sidebar-link-active'))}>
      <Icon className="size-5" aria-hidden="true" /><span>{label}</span>
    </NavLink>
  ))
}

export function SuperAdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    void preloadSuperAdminPages()
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="super-admin-layout super-admin-executive">
      <aside className="sa-sidebar">
        <div className="flex items-center gap-3 px-2"><span className="super-admin-brand-mark"><ShieldCheck className="size-6" /></span><div><p className="text-lg font-black tracking-tight text-slate-950">Zastore</p><p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Boshqaruv markazi</p></div></div>
        <nav className="mt-9 grid gap-2" aria-label="Super admin navigatsiyasi"><NavItems /></nav>
        <div className="mt-auto border-t border-slate-200/80 pt-5">
          <p className="truncate px-3 text-sm font-bold text-slate-800">{user?.firstName} {user?.lastName}</p>
          <p className="mt-1 truncate px-3 text-xs text-slate-500">SUPER ADMIN</p>
          <button type="button" onClick={handleLogout} className="sa-sidebar-link mt-3 w-full text-red-600 hover:bg-red-50"><LogOut className="size-5" />Chiqish</button>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-72">
        <header className="sa-mobile-topbar">
          <div><p className="text-lg font-black tracking-tight text-slate-950">Super Admin</p><p className="text-xs font-semibold text-slate-500">Zastore Platform</p></div>
          <button type="button" onClick={handleLogout} className="sa-icon-button text-red-600" aria-label="Chiqish"><LogOut className="size-5" /></button>
        </header>
        <main className="sa-main"><Outlet /></main>
      </div>

      <nav className="sa-mobile-bottom-nav" aria-label="Super admin mobil navigatsiyasi"><NavItems mobile /></nav>
    </div>
  )
}
