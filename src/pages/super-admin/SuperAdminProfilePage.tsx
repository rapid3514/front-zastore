import { AtSign, Phone, Send, ShieldCheck } from 'lucide-react'
import { AdminStatusBadge } from '@/features/super-admin/components/AdminStatusBadge'
import { ProfileSkeleton, SuperAdminError } from '@/features/super-admin/components/SuperAdminStates'
import { useAdminProfileQuery } from '@/features/super-admin/hooks/use-admins-query'
import { BotBackgroundCard } from '@/features/appearance/components/BotBackgroundCard'

export function SuperAdminProfilePage() {
  const profileQuery = useAdminProfileQuery()
  const profile = profileQuery.data

  return (
    <div className="sa-page-container space-y-6">
      <header><p className="sa-eyebrow">Shaxsiy kabinet</p><h1 className="sa-page-title">Profil</h1><p className="sa-page-description">Platform boshqaruvchisi ma’lumotlari.</p></header>
      {profileQuery.isLoading ? <ProfileSkeleton /> : null}
      {profileQuery.isError ? <SuperAdminError error={profileQuery.error} onRetry={() => void profileQuery.refetch()} /> : null}
      {profile ? (
        <section className="sa-glass rounded-3xl p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="sa-avatar size-20 rounded-3xl text-2xl">{profile.firstName.charAt(0).toLocaleUpperCase('uz')}</span>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-black tracking-tight text-slate-950">{[profile.firstName, profile.lastName].filter(Boolean).join(' ')}</h2><AdminStatusBadge isBlocked={profile.isBlocked} /></div><span className="mt-2 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-extrabold text-indigo-700">SUPER ADMIN</span></div>
          </div>
          <dl className="mt-7 grid gap-3 sm:grid-cols-2">
            <ProfileItem icon={AtSign} label="Username" value={profile.username ? `@${profile.username}` : 'Kiritilmagan'} />
            <ProfileItem icon={Phone} label="Telefon" value={profile.phone ?? 'Kiritilmagan'} />
            <ProfileItem icon={Send} label="Telegram ID" value={profile.telegramId} />
            <ProfileItem icon={ShieldCheck} label="Rol" value="SUPER ADMIN" />
          </dl>
        </section>
      ) : null}
      {profile ? <BotBackgroundCard /> : null}
    </div>
  )
}

function ProfileItem({ icon: Icon, label, value }: { icon: typeof AtSign; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/70 bg-white/45 p-4"><dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"><Icon className="size-4 text-indigo-500" />{label}</dt><dd className="mt-2 break-words font-bold text-slate-900">{value}</dd></div>
}
