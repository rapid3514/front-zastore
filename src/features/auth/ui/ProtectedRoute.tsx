import { Navigate, Outlet } from 'react-router-dom'
import { AuthErrorPage } from '@/pages/auth/AuthErrorPage'
import { AuthLoadingPage } from '@/pages/auth/AuthLoadingPage'
import { RegistrationRequiredPage } from '@/pages/auth/RegistrationRequiredPage'
import { TelegramRequiredPage } from '@/pages/auth/TelegramRequiredPage'
import { useAuthStore } from '../model/auth.store'

export function ProtectedRoute() {
  const status = useAuthStore((state) => state.status)

  if (status === 'idle' || status === 'loading') return <AuthLoadingPage />
  if (status === 'authenticated') return <Outlet />
  if (status === 'registration-required') return <RegistrationRequiredPage />
  if (status === 'error') return <AuthErrorPage />
  if (status === 'unauthenticated') return <TelegramRequiredPage />

  return <Navigate to="/auth/loading" replace />
}
