import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="alert" className={cn('rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950', className)} {...props} />
}

export { Alert }
