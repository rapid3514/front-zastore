import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { normalizeApiError } from '@/shared/api/api-error'
import { useToastStore } from '@/shared/ui/toast-store'
import { useUpdateAdminMutation } from '../hooks/use-update-admin'
import type { AdminUser, UpdateAdminInput } from '../types/super-admin.types'
import { ModalShell } from './ModalShell'

interface EditAdminDialogProps {
  admin: AdminUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAdminDialog({ admin, open, onOpenChange }: EditAdminDialogProps) {
  const [firstName, setFirstName] = useState(admin.firstName)
  const [lastName, setLastName] = useState(admin.lastName ?? '')
  const [username, setUsername] = useState(admin.username ?? '')
  const [error, setError] = useState('')
  const mutation = useUpdateAdminMutation(admin.id)
  const showToast = useToastStore((state) => state.show)

  async function submit(event: FormEvent) {
    event.preventDefault()
    const cleanFirstName = firstName.trim()
    if (!cleanFirstName) {
      setError('Ism kiritilishi shart.')
      return
    }

    const input: UpdateAdminInput = {}
    if (cleanFirstName !== admin.firstName) input.firstName = cleanFirstName
    if (lastName.trim() !== (admin.lastName ?? '')) input.lastName = lastName.trim()
    if (username.trim() !== (admin.username ?? '')) input.username = username.trim().replace(/^@/, '')
    if (Object.keys(input).length === 0) {
      onOpenChange(false)
      return
    }

    try {
      await mutation.mutateAsync(input)
      showToast('Admin ma’lumotlari yangilandi')
      onOpenChange(false)
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    }
  }

  return (
    <ModalShell open={open} title="Admin ma’lumotlarini tahrirlash" description="Faqat backend ruxsat bergan profil maydonlari o‘zgartiriladi." onOpenChange={onOpenChange}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-bold text-slate-700">Ism<input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="sa-input mt-2" maxLength={100} /></label>
        <label className="block text-sm font-bold text-slate-700">Familiya<input value={lastName} onChange={(event) => setLastName(event.target.value)} className="sa-input mt-2" maxLength={100} /></label>
        <label className="block text-sm font-bold text-slate-700">Telegram username<input value={username} onChange={(event) => setUsername(event.target.value)} className="sa-input mt-2" maxLength={100} placeholder="username" /></label>
        {error ? <p className="text-sm font-semibold text-red-600" role="alert">{error}</p> : null}
        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button type="submit" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">{mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}Saqlash</Button>
        </div>
      </form>
    </ModalShell>
  )
}
