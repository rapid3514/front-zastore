import { GlassCard } from '@/components/glass/GlassCard'
import { formatPhone, getRoleLabel } from '../lib/profile-formatters'
import type { ProfileUser } from '../model/profile.types'
import { ProfileInfoRow } from './ProfileInfoRow'

export function ProfileInfoCard({ user }: { user: ProfileUser }) {
  return (
    <GlassCard className="p-5 sm:p-6">
      <h2 className="profile-section-title">Shaxsiy ma’lumotlar</h2>
      <dl className="mt-4">
        <ProfileInfoRow label="Ism" value={user.firstName} />
        <ProfileInfoRow label="Familiya" value={user.lastName || 'Kiritilmagan'} />
        <ProfileInfoRow label="Username" value={user.username ? `@${user.username}` : 'Kiritilmagan'} />
        <ProfileInfoRow label="Telefon" value={formatPhone(user.phone)} />
        <ProfileInfoRow label="Telegram ID" value={<span className="break-all">{user.telegramId}</span>} />
        <ProfileInfoRow label="Rol" value={getRoleLabel(user.role)} />
      </dl>
    </GlassCard>
  )
}
