import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Loader2, UserRoundPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CustomerUser } from '@/features/auth/model/auth.types'
import { normalizeApiError } from '@/shared/api/api-error'
import { useToastStore } from '@/shared/ui/toast-store'
import { usePromoteAdminMutation } from '../hooks/use-promote-admin'
import { CustomerPicker } from './CustomerPicker'
import { ModalShell } from './ModalShell'
import { customerName } from './customer-name'

interface PromoteAdminDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function promotionErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) return message
    if (Array.isArray(message)) {
      const details = message.filter((item): item is string => typeof item === 'string').join(' ')
      if (details) return details
    }
    if (error.response?.status === 403) return 'Bu amal uchun ruxsat yo‘q.'
    if (error.response?.status === 404) return 'Foydalanuvchi topilmadi.'
    if (error.response?.status === 409) return 'Foydalanuvchi allaqachon administrator.'
    if (error.response?.status === 500) return 'Serverda xatolik yuz berdi.'
  }
  return normalizeApiError(error).message
}

export function PromoteAdminDialog({ open, onOpenChange }: PromoteAdminDialogProps) {
  const [selectedUser, setSelectedUser] = useState<CustomerUser | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const mutation = usePromoteAdminMutation()
  const showToast = useToastStore((state) => state.show)

  function requestConfirmation(event: FormEvent) {
    event.preventDefault()
    if (!selectedUser || selectedUser.role !== 'CUSTOMER' || selectedUser.isBlocked) {
      setError('Admin qilish uchun faol foydalanuvchini tanlang.')
      return
    }
    setError('')
    setConfirming(true)
  }

  async function promote() {
    if (!selectedUser || selectedUser.role !== 'CUSTOMER' || selectedUser.isBlocked) return
    try {
      await mutation.mutateAsync(selectedUser.id)
      showToast('Foydalanuvchi administrator etib tayinlandi')
      setSelectedUser(null)
      setConfirming(false)
      setError('')
      onOpenChange(false)
    } catch (cause) {
      setError(promotionErrorMessage(cause))
      setConfirming(false)
    }
  }

  return (
    <ModalShell open={open} title="Admin tayinlash" description="Ro‘yxatdan foydalanuvchini tanlang." onOpenChange={(next) => { if (!mutation.isPending) onOpenChange(next) }}>
      <div hidden={confirming}>
        <form onSubmit={requestConfirmation}>
          <CustomerPicker selected={selectedUser} onSelect={(user) => { setSelectedUser(user); setError('') }} />
          {selectedUser ? <p className="mt-3 truncate text-sm text-slate-600">{[selectedUser.username ? `@${selectedUser.username}` : null, selectedUser.phone].filter(Boolean).join(' · ')}</p> : null}
          {!confirming && error ? <p className="mt-2 text-sm font-semibold text-red-600" role="alert">{error}</p> : null}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
            <Button type="submit" disabled={!selectedUser || selectedUser.isBlocked} className="bg-indigo-600 hover:bg-indigo-700"><UserRoundPlus className="size-4" />Davom etish</Button>
          </div>
        </form>
      </div>
      {confirming && selectedUser ? (
        <div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4">
            <UserRoundPlus className="size-6 text-indigo-600" aria-hidden="true" />
            <p className="mt-3 font-bold text-slate-950">{customerName(selectedUser)} foydalanuvchisini administrator qilmoqchimisiz?</p>
            {selectedUser.username || selectedUser.phone ? <p className="mt-2 truncate text-sm text-slate-600">{[selectedUser.username ? `@${selectedUser.username}` : null, selectedUser.phone].filter(Boolean).join(' · ')}</p> : null}
          </div>
          {error ? <p className="mt-2 text-sm font-semibold text-red-600" role="alert">{error}</p> : null}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => setConfirming(false)}>Bekor qilish</Button>
            <Button type="button" disabled={mutation.isPending} onClick={() => void promote()} className="bg-indigo-600 hover:bg-indigo-700">
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}Admin qilish
            </Button>
          </div>
        </div>
      ) : null}
    </ModalShell>
  )
}
