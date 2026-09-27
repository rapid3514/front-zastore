import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('glass-card', className)} {...props} />
}
