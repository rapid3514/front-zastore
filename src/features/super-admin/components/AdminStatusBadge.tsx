import { Badge } from '@/components/ui/badge'

export function AdminStatusBadge({ isBlocked }: { isBlocked: boolean }) {
  return (
    <Badge className={isBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}>
      <span className={`mr-1.5 size-1.5 rounded-full ${isBlocked ? 'bg-red-500' : 'bg-emerald-500'}`} aria-hidden="true" />
      {isBlocked ? 'Bloklangan' : 'Faol'}
    </Badge>
  )
}
