import { BookOpenText } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'
import { FoodMenuSection } from '@/features/food/ui/FoodMenuSection'
import { WorkHoursStatusBadge } from '@/features/work-hours/ui/WorkHoursStatusBadge'

export function MenuPage() {
  return (
    <main className="page-container space-y-6">
      <GlassCard className="flex items-center gap-4 p-5">
        <span className="header-icon"><BookOpenText className="size-6" aria-hidden="true" /></span>
        <div>
          <h1 className="text-3xl font-black tracking-[-0.045em] text-[#352922]">Menyu</h1>
          <p className="mt-1 text-sm leading-6 text-[#806f65]">Barcha taomlar va bugungi mavjudlik holati</p>
        </div>
      </GlassCard>
      <WorkHoursStatusBadge />
      <FoodMenuSection title="Barcha taomlar" />
    </main>
  )
}
