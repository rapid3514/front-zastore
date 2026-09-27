import { Skeleton } from '@/components/ui/skeleton'

export function AppLoader() {
  return (
    <main className="page-shell" aria-busy="true" aria-label="Yuklanmoqda">
      <section className="w-full max-w-sm space-y-4">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </section>
    </main>
  )
}
