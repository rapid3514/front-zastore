import { Skeleton } from '@/components/ui/skeleton'
import { GlassCard } from '@/components/glass/GlassCard'

export function ProfileSkeleton() {
  return (
    <div className="space-y-5" aria-label="Profil yuklanmoqda">
      <GlassCard className="p-6"><div className="flex flex-col items-center sm:flex-row"><Skeleton className="size-20 rounded-[1.65rem] sm:size-24" /><div className="mt-4 w-full flex-1 space-y-3 sm:mt-0 sm:ml-5"><Skeleton className="mx-auto h-7 w-48 sm:mx-0" /><Skeleton className="mx-auto h-4 w-28 sm:mx-0" /><Skeleton className="mx-auto h-5 w-40 sm:mx-0" /></div></div></GlassCard>
      <div className="grid gap-5 md:grid-cols-2"><GlassCard className="space-y-4 p-5"><Skeleton className="h-6 w-44" />{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-10 w-full rounded-xl" />)}</GlassCard><GlassCard className="space-y-4 p-5"><Skeleton className="h-6 w-28" /><Skeleton className="h-16 w-full rounded-xl" /><Skeleton className="h-16 w-full rounded-xl" /></GlassCard></div>
    </div>
  )
}
