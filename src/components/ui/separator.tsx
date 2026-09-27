import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

function Separator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className={cn('h-px w-full bg-[var(--app-border)]', className)} {...props} />
}

export { Separator }
