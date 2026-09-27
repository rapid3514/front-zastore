import { Loader2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModalShell } from './ModalShell'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  pending?: boolean
  danger?: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function ConfirmDialog({ open, title, description, confirmLabel, pending = false, danger = false, onConfirm, onOpenChange }: ConfirmDialogProps) {
  return (
    <ModalShell open={open} title={title} onOpenChange={onOpenChange}>
      <div className={`flex gap-3 rounded-2xl border p-4 ${danger ? 'border-red-200 bg-red-50/80 text-red-900' : 'border-indigo-200 bg-indigo-50/80 text-indigo-950'}`}>
        <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p className="text-sm leading-6">{description}</p>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>Bekor qilish</Button>
        <Button type="button" disabled={pending} onClick={onConfirm} className={danger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}{confirmLabel}
        </Button>
      </div>
    </ModalShell>
  )
}
