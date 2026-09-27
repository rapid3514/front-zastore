import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AtSign, Phone, Send, Shield, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminActions } from '@/features/super-admin/components/AdminActions'
import { AdminStatusBadge } from '@/features/super-admin/components/AdminStatusBadge'
import { EditAdminDialog } from '@/features/super-admin/components/EditAdminDialog'
import { ProfileSkeleton, SuperAdminError } from '@/features/super-admin/components/SuperAdminStates'
import { useAdminQuery } from '@/features/super-admin/hooks/use-admin-query'

export function AdminDetailsPage() {
  const { userId = '' } = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const adminQuery = useAdminQuery(userId)
  const admin = adminQuery.data

  return (
    <div className="sa-page-container space-y-6">
      <Button asChild variant="ghost" className="-ml-3 text-slate-600"><Link to="/super-admin/admins"><ArrowLeft className="size-4" />Adminlarga qaytish</Link></Button>
      {adminQuery.isLoading ? <ProfileSkeleton /> : null}
      {adminQuery.isError ? <SuperAdminError error={adminQuery.error} onRetry={() => void adminQuery.refetch()} /> : null}
      {admin ? (
        <>
          <section className="sa-glass rounded-3xl p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <span className="sa-avatar size-20 rounded-3xl text-2xl">{admin.firstName.charAt(0).toLocaleUpperCase('uz')}</span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{[admin.firstName, admin.lastName].filter(Boolean).join(' ')}</h1><AdminStatusBadge isBlocked={admin.isBlocked} /></div><p className="mt-2 text-sm font-semibold text-indigo-600">ADMIN</p></div>
              <AdminActions admin={admin} showView={false} onEdit={() => setEditing(true)} onDemoted={() => navigate('/super-admin/admins', { replace: true })} />
            </div>

            <dl className="mt-7 grid gap-3 sm:grid-cols-2">
              <DetailItem icon={UserRound} label="Ism" value={admin.firstName} />
              <DetailItem icon={UserRound} label="Familiya" value={admin.lastName ?? 'Kiritilmagan'} />
              <DetailItem icon={AtSign} label="Username" value={admin.username ? `@${admin.username}` : 'Kiritilmagan'} />
              <DetailItem icon={Phone} label="Telefon" value={admin.phone ?? 'Kiritilmagan'} />
              <DetailItem icon={Send} label="Telegram ID" value={admin.telegramId} />
              <DetailItem icon={Shield} label="Rol" value={admin.role} />
            </dl>

            <div className="mt-6 flex flex-wrap gap-3"><Button type="button" onClick={() => setEditing(true)} className="bg-indigo-600 hover:bg-indigo-700">Tahrirlash</Button></div>
          </section>
          {editing ? <EditAdminDialog admin={admin} open={editing} onOpenChange={setEditing} /> : null}
        </>
      ) : null}
    </div>
  )
}

function DetailItem({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/70 bg-white/45 p-4"><dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"><Icon className="size-4 text-indigo-500" />{label}</dt><dd className="mt-2 break-words font-bold text-slate-900">{value}</dd></div>
}
