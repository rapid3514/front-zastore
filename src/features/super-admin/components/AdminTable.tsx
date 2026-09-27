import { useState } from 'react'
import type { AdminUser } from '../types/super-admin.types'
import { AdminActions } from './AdminActions'
import { AdminStatusBadge } from './AdminStatusBadge'
import { EditAdminDialog } from './EditAdminDialog'

function AdminTableRow({ admin }: { admin: AdminUser }) {
  const [editing, setEditing] = useState(false)
  const name = [admin.firstName, admin.lastName].filter(Boolean).join(' ')

  return (
    <>
      <tr className="border-t border-slate-200/70">
        <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="sa-avatar size-10 rounded-xl text-sm">{admin.firstName.charAt(0).toLocaleUpperCase('uz')}</span><div className="min-w-0"><p className="truncate font-bold text-slate-950">{name}</p><p className="truncate text-sm text-slate-500">{admin.username ? `@${admin.username}` : 'Username yo‘q'}</p></div></div></td>
        <td className="px-5 py-4 text-sm text-slate-600">{admin.telegramId}</td>
        <td className="px-5 py-4 text-sm text-slate-600">{admin.phone ?? '—'}</td>
        <td className="px-5 py-4"><AdminStatusBadge isBlocked={admin.isBlocked} /></td>
        <td className="px-5 py-4 text-right"><AdminActions admin={admin} onEdit={() => setEditing(true)} /></td>
      </tr>
      {editing ? <EditAdminDialog admin={admin} open={editing} onOpenChange={setEditing} /> : null}
    </>
  )
}

export function AdminTable({ admins }: { admins: AdminUser[] }) {
  return (
    <div className="sa-glass hidden overflow-visible rounded-3xl lg:block">
      <table className="w-full table-fixed text-left">
        <thead><tr className="text-xs font-extrabold uppercase tracking-wider text-slate-500"><th className="w-[28%] px-5 py-4">Admin</th><th className="w-[23%] px-5 py-4">Telegram</th><th className="w-[20%] px-5 py-4">Telefon</th><th className="w-[19%] px-5 py-4">Status</th><th className="w-[10%] px-5 py-4 text-right">Amallar</th></tr></thead>
        <tbody>{admins.map((admin) => <AdminTableRow key={admin.id} admin={admin} />)}</tbody>
      </table>
    </div>
  )
}
