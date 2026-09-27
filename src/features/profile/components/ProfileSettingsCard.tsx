import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { ChevronRight, ClipboardList, CircleHelp } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'
import { ThemeToggle } from './ThemeToggle'

export function ProfileSettingsCard() {
  const isAdmin = useLocation().pathname.startsWith('/admin')
  return (
    <GlassCard className="p-3 sm:p-4">
      <h2 className="profile-section-title px-2 pt-1">Sozlamalar</h2>
      <div className="mt-3"><ThemeToggle /></div>
      <Link to={isAdmin ? '/admin/orders' : '/orders'} className="profile-menu-item text-inherit no-underline"><span className="profile-menu-icon"><ClipboardList className="size-5" /></span><span className="flex-1 font-bold text-[#493a32]">Buyurtmalarim</span><ChevronRight className="size-5 text-[#ae9b90]" /></Link>
      {!isAdmin ? <details className="profile-help"><summary className="profile-menu-item cursor-pointer"><span className="profile-menu-icon"><CircleHelp className="size-5" /></span><span className="flex-1 font-bold text-[#493a32]">Yordam</span><ChevronRight className="size-5 text-[#ae9b90]" /></summary><p className="shop-muted px-3 pb-3 text-sm leading-6">Savol yoki takliflaringiz bo‘lsa, Zastore Telegram Mini App administratoriga murojaat qiling.</p></details> : null}
    </GlassCard>
  )
}
