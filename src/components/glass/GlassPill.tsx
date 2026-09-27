import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export function GlassPill({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('glass-pill', className)} {...props} />
}
