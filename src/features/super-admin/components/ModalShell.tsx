import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalShellProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onOpenChange: (open: boolean) => void
}

export function ModalShell({ open, title, description, children, onOpenChange }: ModalShellProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={() => onOpenChange(false)}>
      <div role="dialog" aria-modal="true" aria-labelledby="sa-dialog-title" className="sa-dialog sa-glass max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] p-5 sm:rounded-[1.75rem] sm:p-6" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2 id="sa-dialog-title" className="text-xl font-extrabold tracking-tight text-slate-950">{title}</h2>
            {description ? <p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>
          <button type="button" onClick={() => onOpenChange(false)} className="sa-icon-button" aria-label="Oynani yopish"><X className="size-5" /></button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
