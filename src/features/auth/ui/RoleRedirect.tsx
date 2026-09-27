import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AuthErrorPage } from '@/pages/auth/AuthErrorPage'
import { AuthLoadingPage } from '@/pages/auth/AuthLoadingPage'
import { RegistrationRequiredPage } from '@/pages/auth/RegistrationRequiredPage'
import { TelegramRequiredPage } from '@/pages/auth/TelegramRequiredPage'
import { useAuthStore } from '../model/auth.store'

export function RoleRedirect() {
  const status = useAuthStore((state) => state.status)
  const role = useAuthStore((state) => state.user?.role)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (status !== 'authenticated' || !role) return
    if (role === 'SUPER_ADMIN' && !location.pathname.startsWith('/super-admin')) navigate('/super-admin', { replace: true })
    if (role === 'ADMIN' && !location.pathname.startsWith('/admin')) navigate('/admin', { replace: true })
    if (role === 'CUSTOMER' && (location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin'))) navigate('/', { replace: true })
  }, [location.pathname, navigate, role, status])

  if (status === 'idle' || status === 'loading') return <AuthLoadingPage />
  if (status === 'registration-required') return <RegistrationRequiredPage />
  if (status === 'error') return <AuthErrorPage />
  if (status === 'unauthenticated') return <TelegramRequiredPage />
  if (status === 'authenticated') return <Outlet />

  return <AuthLoadingPage />
}
