import { useEffect, useRef, type ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AuthErrorPage } from '@/pages/auth/AuthErrorPage'
import { AuthLoadingPage } from '@/pages/auth/AuthLoadingPage'
import { RegistrationRequiredPage } from '@/pages/auth/RegistrationRequiredPage'
import { TelegramRequiredPage } from '@/pages/auth/TelegramRequiredPage'
import { preloadAdminShell, preloadSuperAdminShell } from '@/app/admin-page-loaders'
import { useTelegramStartParam } from '@/features/telegram/hooks/useTelegramStartParam'
import { useAuthStore } from '../model/auth.store'

export function RoleRedirect() {
  const status = useAuthStore((state) => state.status)
  const role = useAuthStore((state) => state.user?.role)
  const location = useLocation()
  const navigate = useNavigate()
  const isSuperAdminPath = location.pathname.startsWith('/super-admin')
  const telegramProductId = useTelegramStartParam()
  const telegramProductPath = telegramProductId
    ? `/order/${encodeURIComponent(telegramProductId)}`
    : null
  const handledTelegramProductPath = useRef<string | null>(null)

  const renderAuthScreen = (screen: ReactNode) => (
    isSuperAdminPath ? screen : <div className="lumiera-auth-shell">{screen}</div>
  )

  useEffect(() => {
    if (status !== 'authenticated') return
    if (role === 'ADMIN') void preloadAdminShell()
    if (role === 'SUPER_ADMIN') void preloadSuperAdminShell()
  }, [role, status])

  useEffect(() => {
    if (status !== 'authenticated' || !role) return
    if (
      telegramProductPath &&
      handledTelegramProductPath.current !== telegramProductPath
    ) {
      handledTelegramProductPath.current = telegramProductPath
      if (location.pathname !== telegramProductPath) {
        navigate(telegramProductPath, { replace: true })
      }
      return
    }
    if (telegramProductPath === location.pathname) return
    if (role === 'SUPER_ADMIN' && !location.pathname.startsWith('/super-admin')) navigate('/super-admin', { replace: true })
    if (role === 'ADMIN' && !location.pathname.startsWith('/admin')) navigate('/admin', { replace: true })
    if (
      role === 'CUSTOMER' &&
      (location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin'))
    )
      navigate('/', { replace: true })
  }, [location.pathname, navigate, role, status, telegramProductPath])

  if (status === 'idle' || status === 'loading') return renderAuthScreen(<AuthLoadingPage />)
  if (status === 'registration-required') return renderAuthScreen(<RegistrationRequiredPage />)
  if (status === 'error') return renderAuthScreen(<AuthErrorPage />)
  if (status === 'unauthenticated') return renderAuthScreen(<TelegramRequiredPage />)
  if (status === 'authenticated') return <Outlet />

  return renderAuthScreen(<AuthLoadingPage />)
}
