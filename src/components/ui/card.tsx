import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-[var(--app-border)] bg-[var(--tg-secondary-bg)] shadow-sm', className)} {...props} />
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pb-3', className)} {...props} />
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-3', className)} {...props} />
}

export { Card, CardContent, CardHeader }
