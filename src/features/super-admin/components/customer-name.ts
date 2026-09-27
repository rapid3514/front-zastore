import type { CustomerUser } from '@/features/auth/model/auth.types'

export function customerName(user: CustomerUser): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ')
}
