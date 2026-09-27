import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Check, ChevronDown, Loader2, Search } from 'lucide-react'
import type { CustomerUser } from '@/features/auth/model/auth.types'
import { useCustomerUsersQuery } from '../hooks/use-users-query'
import { customerName } from './customer-name'

interface CustomerPickerProps {
  selected: CustomerUser | null
  onSelect: (user: CustomerUser) => void
}

export function CustomerPicker({ selected, onSelect }: CustomerPickerProps) {
  const [expanded, setExpanded] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const usersQuery = useCustomerUsersQuery(debouncedSearch)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => window.clearTimeout(timer)
  }, [search])

  const users = usersQuery.data?.data.filter((user) => user.role === 'CUSTOMER') ?? []
  const loading = search.trim() !== debouncedSearch || usersQuery.isPending

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      setExpanded(false)
      triggerRef.current?.focus()
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      listRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
    }
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      setExpanded(false)
      triggerRef.current?.focus()
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const options = [...(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]:not(:disabled)') ?? [])]
      const index = options.indexOf(event.currentTarget)
      options[index + (event.key === 'ArrowDown' ? 1 : -1)]?.focus()
    }
  }

  return (
    <div>
      <span id="promote-user-label" className="text-sm font-bold text-slate-700">Foydalanuvchi</span>
      <button
        ref={triggerRef}
        type="button"
        aria-labelledby="promote-user-label"
        aria-haspopup="listbox"
        aria-expanded={expanded}
        aria-controls={expanded ? 'promote-user-list' : undefined}
        onClick={() => setExpanded((value) => !value)}
        className="sa-input mt-2 flex items-center justify-between gap-3 text-left"
      >
        <span className={`min-w-0 flex-1 truncate ${selected ? 'text-slate-950' : 'text-slate-500'}`}>
          {selected ? customerName(selected) : 'Foydalanuvchi tanlang'}
        </span>
        <ChevronDown className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
      </button>

      {expanded ? (
        <div className="sa-glass mt-2 rounded-2xl border border-slate-200 p-2 shadow-lg">
          <label className="sa-search">
            <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Foydalanuvchi qidirish</span>
            <input
              autoFocus
              role="combobox"
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls="promote-user-list"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="User qidirish..."
              maxLength={100}
              autoComplete="off"
            />
          </label>
          <div id="promote-user-list" ref={listRef} role="listbox" aria-label="Customer foydalanuvchilar" className="mt-2 max-h-60 space-y-1 overflow-y-auto">
            {loading ? <p className="px-3 py-4 text-sm text-slate-500"><Loader2 className="mr-2 inline size-4 animate-spin" />Foydalanuvchilar yuklanmoqda...</p> : null}
            {!loading && usersQuery.isError ? (
              <div className="px-3 py-4 text-sm text-red-600">
                <p>Foydalanuvchilarni yuklashda xatolik yuz berdi.</p>
                <button type="button" onClick={() => void usersQuery.refetch()} className="mt-2 font-bold underline">Qayta urinish</button>
              </div>
            ) : null}
            {!loading && !usersQuery.isError && users.length === 0 ? <p className="px-3 py-4 text-sm text-slate-500">Foydalanuvchi topilmadi</p> : null}
            {!loading && !usersQuery.isError ? users.map((user) => (
              <button
                key={user.id}
                type="button"
                role="option"
                aria-selected={selected?.id === user.id}
                disabled={user.isBlocked}
                onKeyDown={handleOptionKeyDown}
                onClick={() => { onSelect(user); setExpanded(false); setSearch(''); setDebouncedSearch('') }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-indigo-50 focus-visible:bg-indigo-50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-950">{customerName(user)}</span>
                  {user.username || user.phone ? <span className="block truncate text-xs text-slate-500">{[user.username ? `@${user.username}` : null, user.phone].filter(Boolean).join(' · ')}</span> : null}
                </span>
                {user.isBlocked ? <span className="shrink-0 rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">Bloklangan</span> : null}
                {selected?.id === user.id ? <Check className="size-4 shrink-0 text-indigo-600" aria-hidden="true" /> : null}
              </button>
            )) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
