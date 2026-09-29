import { Search, UserRoundX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { normalizeApiError } from '@/shared/api/api-error'
import { cn } from '@/shared/lib/cn'
import type { OnlineFilter, RoleFilter, UserListItem, UsersPage } from '../model/user.types'
import { formatLastSeen, roleLabel } from '../lib/user-formatters'

interface DirectoryFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  online: OnlineFilter
  onOnlineChange: (value: OnlineFilter) => void
  role?: RoleFilter
  onRoleChange?: (value: RoleFilter) => void
}

const roleFilters: Array<{ value: RoleFilter; label: string }> = [
  { value: 'ALL', label: 'Barchasi' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super admin' },
]

const onlineFilters: Array<{ value: OnlineFilter; label: string }> = [
  { value: 'ALL', label: 'Barchasi' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Offline' },
]

export function DirectoryFilters({ search, onSearchChange, online, onOnlineChange, role, onRoleChange }: DirectoryFiltersProps) {
  return (
    <div className="sa-glass rounded-2xl p-3 sm:p-4">
      <label className="sa-search">
        <Search className="size-5 shrink-0 text-slate-400" aria-hidden="true" />
        <span className="sr-only">Foydalanuvchi qidirish</span>
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Ism, username yoki Telegram ID..." />
      </label>
      {role && onRoleChange ? (
        <div className="mt-3">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">Rol</p>
          <div className="flex flex-wrap gap-2" aria-label="Rol bo‘yicha filtr">
            {roleFilters.map((item) => <FilterButton key={item.value} selected={role === item.value} onClick={() => onRoleChange(item.value)}>{item.label}</FilterButton>)}
          </div>
        </div>
      ) : null}
      <div className="mt-3">
        <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">Status</p>
        <div className="flex flex-wrap gap-2" aria-label="Online holati bo‘yicha filtr">
          {onlineFilters.map((item) => <FilterButton key={item.value} selected={online === item.value} onClick={() => onOnlineChange(item.value)}>{item.label}</FilterButton>)}
        </div>
      </div>
    </div>
  )
}

function FilterButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: string }) {
  return <button type="button" aria-pressed={selected} onClick={onClick} className={cn('sa-filter-chip', selected && 'sa-filter-chip-active')}>{children}</button>
}

function UserAvatar({ user }: { user: UserListItem }) {
  const initial = (user.fullName || user.username || '?').charAt(0).toLocaleUpperCase('uz')
  return user.avatarUrl
    ? <img src={user.avatarUrl} alt="" loading="lazy" className="sa-avatar size-11 rounded-xl object-cover" />
    : <span className="sa-avatar size-11 rounded-xl text-sm">{initial}</span>
}

function UserIdentity({ user, label }: { user: UserListItem; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar user={user} />
      <div className="min-w-0">
        <p className="truncate font-bold text-slate-950">{user.fullName || label}</p>
        <p className="truncate text-sm text-slate-500">{user.username ? `@${user.username}` : 'Username yo‘q'}</p>
      </div>
    </div>
  )
}

function OnlineStatus({ isOnline }: { isOnline: boolean }) {
  return <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700"><span className={cn('size-2.5 rounded-full', isOnline ? 'bg-emerald-500' : 'bg-slate-400')} aria-hidden="true" />{isOnline ? 'Online' : 'Offline'}</span>
}

function RoleBadge({ role }: { role: UserListItem['role'] }) {
  return <Badge className={cn('user-role-badge', `user-role-${role.toLocaleLowerCase().replace('_', '-')}`)}>{roleLabel(role)}</Badge>
}

function UserCard({ user, showRole }: { user: UserListItem; showRole: boolean }) {
  return (
    <article className="sa-glass rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <UserIdentity user={user} label="Foydalanuvchi" />
        {showRole ? <RoleBadge role={user.role} /> : null}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200/70 pt-4 text-sm">
        <div><dt className="text-xs font-semibold text-slate-500">Telegram</dt><dd className="mt-1 truncate font-bold text-slate-700">{user.telegramId ?? '—'}</dd></div>
        <div><dt className="text-xs font-semibold text-slate-500">Status</dt><dd className="mt-1"><OnlineStatus isOnline={user.isOnline} /></dd></div>
        <div className="col-span-2"><dt className="text-xs font-semibold text-slate-500">Oxirgi faollik</dt><dd className="mt-1 font-bold text-slate-700">{formatLastSeen(user.lastSeenAt, user.isOnline)}</dd></div>
      </dl>
    </article>
  )
}

function UserTable({ users, showRole }: { users: UserListItem[]; showRole: boolean }) {
  return (
    <div className="sa-glass hidden overflow-x-auto rounded-2xl md:block">
      <table className="w-full min-w-[46rem] text-left">
        <thead><tr className="text-xs font-extrabold uppercase tracking-wider text-slate-500"><th className="px-5 py-4">{showRole ? 'User' : 'Customer'}</th><th className="px-5 py-4">Telegram</th>{showRole ? <th className="px-5 py-4">Rol</th> : null}<th className="px-5 py-4">Status</th><th className="px-5 py-4">Oxirgi faollik</th></tr></thead>
        <tbody>{users.map((user) => (
          <tr key={user.id} className="border-t border-slate-200/70">
            <td className="px-5 py-4"><UserIdentity user={user} label={showRole ? 'Foydalanuvchi' : 'Customer'} /></td>
            <td className="px-5 py-4 text-sm font-semibold text-slate-600">{user.telegramId ?? '—'}</td>
            {showRole ? <td className="px-5 py-4"><RoleBadge role={user.role} /></td> : null}
            <td className="px-5 py-4"><OnlineStatus isOnline={user.isOnline} /></td>
            <td className="px-5 py-4 text-sm font-semibold text-slate-600">{formatLastSeen(user.lastSeenAt, user.isOnline)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}

export function UserDirectorySkeleton() {
  return <><div className="grid gap-3 md:hidden">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-44 rounded-2xl" />)}</div><Skeleton className="hidden h-80 rounded-2xl md:block" /></>
}

export function UserDirectoryError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return <div className="sa-glass rounded-2xl p-7 text-center"><h2 className="text-lg font-extrabold text-slate-950">Ma’lumotni yuklab bo‘lmadi</h2><p className="mt-2 text-sm text-slate-600">{normalizeApiError(error).message}</p><Button type="button" variant="outline" onClick={onRetry} className="mt-5">Qayta urinish</Button></div>
}

export function UserDirectoryResults({ page, showRole }: { page: UsersPage; showRole: boolean }) {
  if (page.data.length === 0) {
    return <div className="sa-glass rounded-2xl p-8 text-center"><UserRoundX className="mx-auto size-9 text-slate-400" /><h2 className="mt-3 font-extrabold text-slate-950">Mos foydalanuvchi topilmadi</h2><p className="mt-2 text-sm text-slate-500">Qidiruv yoki filtrlarni o‘zgartirib ko‘ring.</p></div>
  }

  return <><div className="grid gap-3 md:hidden">{page.data.map((user) => <UserCard key={user.id} user={user} showRole={showRole} />)}</div><UserTable users={page.data} showRole={showRole} /></>
}

export function DirectoryPagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center gap-3" aria-label="Sahifalash">
      <Button type="button" variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Oldingi</Button>
      <span className="text-sm font-bold text-slate-700" aria-current="page">{page} / {totalPages}</span>
      <Button type="button" variant="outline" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Keyingi</Button>
    </nav>
  )
}
