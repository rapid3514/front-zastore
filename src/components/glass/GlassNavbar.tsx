import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export function GlassNavbar({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <header className={cn('glass-navbar', className)} {...props} />
}
