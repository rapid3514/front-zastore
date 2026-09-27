import { RotateCcw, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuthStore } from '@/features/auth/model/auth.store'

export function AuthErrorPage() {
  const error = useAuthStore((state) => state.error)

  return (
    <main className="page-shell">
      <Card className="glass-card w-full max-w-sm">
        <CardHeader>
          <ShieldAlert className="mb-4 size-8 text-rose-600" aria-hidden="true" />
          <h1 className="text-xl font-bold text-[var(--tg-text)]">Xatolik yuz berdi</h1>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm leading-6 text-[var(--app-muted)]">{error ?? 'Autentifikatsiyani tekshirib bo‘lmadi.'}</p>
          <Button className="w-full" onClick={() => window.location.reload()}>
            <RotateCcw className="size-4" aria-hidden="true" /> Qayta urinish
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
