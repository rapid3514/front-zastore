import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface ProtectedSectionPageProps {
  title: string
  icon: ReactNode
}

export function ProtectedSectionPage({ title, icon }: ProtectedSectionPageProps) {
  return (
    <main className="mx-auto flex min-h-[60dvh] w-full max-w-md items-center px-4 py-8">
      <Card className="glass-status-card w-full text-center">
        <CardHeader className="items-center">
          <span className="mx-auto mb-3 grid size-11 place-items-center rounded-2xl bg-[#f5e2df] text-[#945d66]">{icon}</span>
          <h1 className="font-serif text-2xl font-semibold text-[#3a2a2f]">{title}</h1>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-[#78666a]">Bu bo‘lim keyingi bosqichda to‘liq ishga tushiriladi.</p>
        </CardContent>
      </Card>
    </main>
  )
}
