import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'

interface ModalShellProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onOpenChange: (open: boolean) => void
}

export function ModalShell({ open, title, description, children, onOpenChange }: ModalShellProps) {
  const location = useLocation()
  const isAdminPanel = location.pathname.startsWith('/admin')
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus first element on open
    const frame = window.requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
        'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled])',
      )
      firstFocusable?.focus()
    })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false)
        return
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-5',
        isAdminPanel && 'admin-modal-surface',
      )}
      onClick={() => onOpenChange(false)}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sa-dialog-title"
        className="sa-dialog sa-glass max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] p-5 sm:rounded-[1.75rem] sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2 id="sa-dialog-title" className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100">
              {title}
            </h2>
            {description ? (
              <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="sa-icon-button"
            aria-label="Oynani yopish"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
