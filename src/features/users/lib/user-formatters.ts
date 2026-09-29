import type { ManagedUserRole } from '../model/user.types'

const absoluteFormatter = new Intl.DateTimeFormat('uz-UZ', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatLastSeen(lastSeenAt: string | null, isOnline: boolean) {
  if (isOnline) return 'Hozir'
  if (!lastSeenAt) return 'Noma’lum'

  const seenAt = new Date(lastSeenAt)
  if (Number.isNaN(seenAt.getTime())) return 'Noma’lum'

  const elapsedMs = Math.max(0, Date.now() - seenAt.getTime())
  const minutes = Math.floor(elapsedMs / 60_000)
  if (minutes < 1) return 'Hozir'
  if (minutes < 60) return `${minutes} daqiqa oldin`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} soat oldin`

  return absoluteFormatter.format(seenAt).replace(',', '')
}

export function roleLabel(role: ManagedUserRole) {
  if (role === 'SUPER_ADMIN') return 'Super admin'
  if (role === 'ADMIN') return 'Admin'
  return 'Customer'
}
