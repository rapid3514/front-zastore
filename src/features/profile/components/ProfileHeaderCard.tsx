import { BadgeCheck, Send } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'
import { formatPhone, getFullName, getProfileInitials, getRoleLabel } from '../lib/profile-formatters'
import type { ProfileUser } from '../model/profile.types'

export function ProfileHeaderCard({ user }: { user: ProfileUser }) {
  return (
    <GlassCard className="profile-header-card overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
        {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="profile-avatar size-20 rounded-[1.65rem] object-cover sm:size-24" /> : <div className="profile-avatar size-20 rounded-[1.65rem] text-2xl sm:size-24 sm:text-3xl" aria-label={`${getFullName(user)} bosh harflari`}>{getProfileInitials(user)}</div>}
        <div className="mt-4 min-w-0 flex-1 sm:mt-0 sm:ml-5">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <h2 className="break-words text-2xl font-black tracking-[-0.035em] text-[#352922] sm:text-3xl">{getFullName(user)}</h2>
            <span className="profile-role-badge"><BadgeCheck className="size-3.5" />{getRoleLabel(user.role)}</span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-[#806f65]">{user.username ? `@${user.username}` : 'Username kiritilmagan'}</p>
          <p className="mt-4 text-lg font-extrabold text-[#493a32]">{formatPhone(user.phone)}</p>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-[#806f65] sm:justify-start"><Send className="size-4 text-[#e0662d]" />Telegram ID: <span className="break-all font-semibold">{user.telegramId}</span></p>
        </div>
      </div>
    </GlassCard>
  )
}
