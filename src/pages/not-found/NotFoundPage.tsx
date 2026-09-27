import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <main className="page-shell text-center">
      <div className="space-y-4">
        <p className="text-sm font-semibold text-[var(--app-muted)]">404</p>
        <h1 className="text-2xl font-bold text-[var(--tg-text)]">Sahifa topilmadi</h1>
        <Button asChild><Link to="/">Bosh sahifaga qaytish</Link></Button>
      </div>
    </main>
  )
}
