import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CircleAlert, Loader2, LogOut, MessageCircleWarning, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass/GlassCard'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { ProfileHeaderCard } from '@/features/profile/components/ProfileHeaderCard'
import { ProfileInfoCard } from '@/features/profile/components/ProfileInfoCard'
import { ProfileSettingsCard } from '@/features/profile/components/ProfileSettingsCard'
import { ProfileSkeleton } from '@/features/profile/components/ProfileSkeleton'
import { useProfileQuery } from '@/features/profile/hooks/use-profile-query'
import { normalizeApiError } from '@/shared/api/api-error'
import { ThemeToggle } from '@/features/profile/components/ThemeToggle'
import { BotBackgroundCard } from '@/features/appearance/components/BotBackgroundCard'

export function ProfilePage() {
  const { status, error: authError, logout } = useAuth()
  const profileQuery = useProfileQuery(status === 'authenticated')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const isAdmin = useLocation().pathname.startsWith('/admin')

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch {
      // Local auth state is cleared by the existing logout flow even if the request fails.
    } finally {
      navigate('/', { replace: true })
      setIsLoggingOut(false)
    }
  }

  return (
    <main className="profile-page page-container">
      <header className="mb-5">
        {isAdmin ? <p className="shop-eyebrow">SHAXSIY KABINET</p> : null}
        <h1 className="shop-page-title">Profil</h1>
      </header>

      {status === 'idle' || status === 'loading' ? <ProfileSkeleton /> : null}

      {status === 'unauthenticated' || status === 'registration-required' ? (
        <GlassCard className="mx-auto max-w-lg p-7 text-center">
          <span className="profile-state-icon"><MessageCircleWarning className="size-7" /></span>
          <h2 className="mt-4 text-xl font-black text-[#352922]">Telegram orqali kiring</h2>
          <p className="mt-3 text-sm leading-6 text-[#806f65]">Profilni ko‘rish uchun Telegram Mini App orqali kiring.</p>
        </GlassCard>
      ) : null}

      {status === 'error' ? (
        <GlassCard className="mx-auto max-w-lg p-7 text-center">
          <span className="profile-state-icon profile-state-icon-error"><CircleAlert className="size-7" /></span>
          <h2 className="mt-4 text-xl font-black text-[#352922]">Profilni ochib bo‘lmadi</h2>
          <p className="mt-3 text-sm leading-6 text-[#806f65]">{authError ?? 'Avtorizatsiyada xatolik yuz berdi.'}</p>
        </GlassCard>
      ) : null}

      {status === 'authenticated' && profileQuery.isLoading ? <ProfileSkeleton /> : null}

      {status === 'authenticated' && profileQuery.isError ? (
        <GlassCard className="mx-auto max-w-lg p-7 text-center">
          <span className="profile-state-icon profile-state-icon-error"><CircleAlert className="size-7" /></span>
          <h2 className="mt-4 text-xl font-black text-[#352922]">Profilni yuklab bo‘lmadi</h2>
          <p className="mt-3 text-sm leading-6 text-[#806f65]">{normalizeApiError(profileQuery.error).status === 403 ? 'Profilni ko‘rish uchun ruxsatingiz yo‘q.' : normalizeApiError(profileQuery.error).message}</p>
          <Button type="button" variant="outline" onClick={() => void profileQuery.refetch()} className="mt-5"><RefreshCw className="size-4" />Qayta urinish</Button>
        </GlassCard>
      ) : null}

      {status === 'authenticated' && profileQuery.data ? (
        <div className={`space-y-4 ${isAdmin ? '' : 'shop-profile-stack'}`}>
          <ProfileHeaderCard user={profileQuery.data} />
          {isAdmin ? <div className="grid items-start gap-5 md:grid-cols-2"><ProfileInfoCard user={profileQuery.data} /><ProfileSettingsCard /></div> : <><ProfileSettingsCard /><ProfileInfoCard user={profileQuery.data} /></>}
          {profileQuery.data.role === 'ADMIN' || profileQuery.data.role === 'SUPER_ADMIN' ? <BotBackgroundCard /> : null}
          <Button type="button" variant="outline" disabled={isLoggingOut} onClick={handleLogout} className="profile-logout-button w-full">
            {isLoggingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}Chiqish
          </Button>
        </div>
      ) : null}
      {status === 'unauthenticated' || status === 'registration-required' || status === 'error' ? <GlassCard className="mx-auto mt-5 max-w-lg p-4"><ThemeToggle /></GlassCard> : null}
    </main>
  )
}
