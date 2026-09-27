import type { UserRole } from '@/features/auth/model/auth.types'
import type { ProfileUser } from '../model/profile.types'

const roleLabels: Record<UserRole, string> = {
  GUEST: 'Mehmon',
  CUSTOMER: 'Mijoz',
  ADMIN: 'Administrator',
  SUPER_ADMIN: 'Super Admin',
}

export function formatPhone(phone?: string | null): string {
  if (!phone) return 'Kiritilmagan'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`
  }
  return phone
}

export function getProfileInitials(user: ProfileUser): string {
  const initials = [user.firstName, user.lastName]
    .filter((part): part is string => Boolean(part?.trim()))
    .map((part) => part.trim().charAt(0).toLocaleUpperCase('uz'))
    .join('')
  return initials.slice(0, 2) || 'Z'
}

export function getFullName(user: ProfileUser): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ')
}

export function getRoleLabel(role: UserRole): string {
  return roleLabels[role]
}
