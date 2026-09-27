import { Navigate, Outlet } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { AuthErrorPage } from '@/pages/auth/AuthErrorPage'
import { RegistrationRequiredPage } from '@/pages/auth/RegistrationRequiredPage'
import { TelegramRequiredPage } from '@/pages/auth/TelegramRequiredPage'
import { useAuthStore } from '../model/auth.store'
import { AccessDeniedPage } from './AccessDeniedPage'

function GuardSkeleton() {
  return <main className="sa-auth-page"><div className="sa-glass w-full max-w-md rounded-3xl p-7"><Skeleton className="mx-auto size-16 rounded-2xl" /><Skeleton className="mx-auto mt-5 h-7 w-4/5" /><Skeleton className="mx-auto mt-3 h-4 w-3/5" /><Skeleton className="mx-auto mt-6 h-11 w-40 rounded-xl" /></div></main>
}

export function SuperAdminRoute() {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)

  if (status === 'idle' || status === 'loading') return <GuardSkeleton />
  if (status === 'registration-required') return <RegistrationRequiredPage />
  if (status === 'unauthenticated') return <TelegramRequiredPage />
  if (status === 'error') return <AuthErrorPage />
  if (status === 'authenticated' && user?.role === 'SUPER_ADMIN') return <Outlet />
  if (status === 'authenticated') return <AccessDeniedPage role={user?.role} />
  return <Navigate to="/" replace />
}
