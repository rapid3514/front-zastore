import { useEffect } from 'react'
import { CheckCircle2, X, XCircle } from 'lucide-react'
import { useToastStore } from './toast-store'

export function AppToastViewport() {
  const items = useToastStore((state) => state.items)
  const dismiss = useToastStore((state) => state.dismiss)

  useEffect(() => () => useToastStore.setState({ items: [] }), [])

  return (
    <div className="fixed inset-x-3 top-3 z-[100] flex flex-col items-center gap-2 pt-[env(safe-area-inset-top)] sm:left-auto sm:right-5 sm:w-96" aria-live="polite">
      {items.map((item) => {
        const Icon = item.tone === 'success' ? CheckCircle2 : XCircle
        return (
          <div key={item.id} className={`app-toast app-toast-${item.tone} flex w-full items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-xl ${item.tone === 'success' ? 'border-emerald-200/80 bg-emerald-50/95 text-emerald-900' : 'border-red-200/80 bg-red-50/95 text-red-900'}`}>
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-sm font-semibold">{item.message}</p>
            <button type="button" onClick={() => dismiss(item.id)} className="grid size-9 place-items-center rounded-xl hover:bg-black/5" aria-label="Xabarni yopish"><X className="size-4" /></button>
          </div>
        )
      })}
    </div>
  )
}
