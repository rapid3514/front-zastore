import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-black/10', className)} {...props} />
}

export { Skeleton }
