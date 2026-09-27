import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800', className)} {...props} />
}

export { Badge }
