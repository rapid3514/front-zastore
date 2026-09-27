import { CircleAlert, RefreshCw, UserRoundX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { normalizeApiError } from '@/shared/api/api-error'

export function AdminListSkeleton() {
  return <div className="grid gap-3 lg:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="sa-glass rounded-3xl p-5"><div className="flex gap-3"><Skeleton className="size-12 rounded-2xl" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-1/3" /></div></div><Skeleton className="mt-5 h-12 w-full rounded-xl" /></div>)}</div>
}

export function ProfileSkeleton() {
  return <div className="sa-glass rounded-3xl p-6"><div className="flex gap-4"><Skeleton className="size-16 rounded-2xl" /><div className="flex-1 space-y-2"><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-1/3" /></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-20 rounded-2xl" />)}</div></div>
}

export function SuperAdminError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return <div className="sa-glass rounded-3xl p-6 text-center"><CircleAlert className="mx-auto size-9 text-red-500" /><h2 className="mt-3 text-lg font-extrabold text-slate-950">Ma’lumotni yuklab bo‘lmadi</h2><p className="mt-2 text-sm text-slate-600">{normalizeApiError(error).message}</p><Button type="button" variant="outline" onClick={onRetry} className="mt-5"><RefreshCw className="size-4" />Qayta urinish</Button></div>
}

export function AdminEmptyState({ onPromote }: { onPromote: () => void }) {
  return <div className="sa-glass rounded-3xl p-8 text-center"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-100 text-indigo-600"><UserRoundX className="size-7" /></span><h2 className="mt-4 text-lg font-extrabold text-slate-950">Hozircha adminlar mavjud emas.</h2><Button type="button" onClick={onPromote} className="mt-5 bg-indigo-600 hover:bg-indigo-700">Admin tayinlash</Button></div>
}
