import { useState } from 'react'
import { AtSign, Phone, Send } from 'lucide-react'
import type { AdminUser } from '../types/super-admin.types'
import { AdminActions } from './AdminActions'
import { AdminStatusBadge } from './AdminStatusBadge'
import { EditAdminDialog } from './EditAdminDialog'

function fullName(admin: AdminUser) {
  return [admin.firstName, admin.lastName].filter(Boolean).join(' ')
}

export function AdminCard({ admin }: { admin: AdminUser }) {
  const [editing, setEditing] = useState(false)

  return (
    <article className="sa-glass rounded-3xl p-4">
      <div className="flex items-start gap-3">
        <span className="sa-avatar" aria-hidden="true">{admin.firstName.charAt(0).toLocaleUpperCase('uz')}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-extrabold text-slate-950">{fullName(admin)}</p>
          <div className="mt-2"><AdminStatusBadge isBlocked={admin.isBlocked} /></div>
        </div>
        <AdminActions admin={admin} onEdit={() => setEditing(true)} />
      </div>
      <dl className="mt-4 grid gap-2 text-sm text-slate-600">
        <div className="flex min-w-0 items-center gap-2"><AtSign className="size-4 shrink-0 text-indigo-500" /><dd className="truncate">{admin.username ? `@${admin.username}` : 'Username yo‘q'}</dd></div>
        <div className="flex min-w-0 items-center gap-2"><Phone className="size-4 shrink-0 text-indigo-500" /><dd className="truncate">{admin.phone ?? 'Telefon yo‘q'}</dd></div>
        <div className="flex min-w-0 items-center gap-2"><Send className="size-4 shrink-0 text-indigo-500" /><dd className="truncate">ID: {admin.telegramId}</dd></div>
      </dl>
      {editing ? <EditAdminDialog admin={admin} open={editing} onOpenChange={setEditing} /> : null}
    </article>
  )
}
